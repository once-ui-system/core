import { baseURL, landing } from "@/resources";
import { getPosts } from "@/lib/blog";
import { formatDate } from "@/utils";
import { Card, Column, Heading, Meta, Schema, Text } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.blog.title,
    description: landing.blog.description,
    baseURL: baseURL,
    path: landing.blog.path,
    canonical: landing.blog.canonical,
    image: landing.blog.image,
    robots: landing.blog.robots,
    alternates: landing.blog.alternates,
  });
}

export default function Blog() {
  const posts = getPosts();
  return (
    <Column fillWidth maxWidth="s" gap="32" paddingX="l" s={{ paddingX: "16" }}>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={landing.blog.title}
        description={landing.blog.description}
        path={landing.blog.path}
      />
      <Heading as="h1" variant="display-strong-s">
        Blog
      </Heading>
      <Column gap="16" fillWidth>
        {posts.map((post) => (
          <Card
            key={post.slug}
            href={`/blog/${post.slug}`}
            direction="column"
            gap="8"
            padding="24"
            radius="l"
            border="neutral-alpha-medium"
            fillWidth
          >
            <Text variant="label-default-s" onBackground="neutral-weak">
              {formatDate(post.publishedAt)}
            </Text>
            <Heading as="h2" variant="heading-strong-l">
              {post.title}
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-medium">
              {post.summary}
            </Text>
          </Card>
        ))}
      </Column>
    </Column>
  );
}
