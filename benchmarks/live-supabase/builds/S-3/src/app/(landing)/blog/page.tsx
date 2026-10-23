import { baseURL, landing } from "@/resources";
import { formatDate } from "@/utils";
import { getPosts } from "@/utils/utils";
import { Card, Column, Heading, Meta, Schema, Text } from "@once-ui-system/core";

export async function generateMetadata() {
  return Meta.generate({
    title: landing.blog.title,
    description: landing.blog.description,
    baseURL: baseURL,
    image: landing.blog.image,
    path: landing.blog.path,
    canonical: landing.blog.canonical,
    alternates: landing.blog.alternates,
  });
}

export default function Blog() {
  const posts = getPosts();
  return (
    <Column fillWidth maxWidth="m" gap="32" paddingX="l" s={{ paddingX: "16" }}>
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
      <Column fillWidth gap="12">
        {posts.map((post) => (
          <Card
            key={post.slug}
            href={`/blog/${post.slug}`}
            direction="column"
            radius="l"
            padding="24"
            gap="8"
            background="transparent"
            border="neutral-alpha-weak"
            fillWidth
          >
            <Text variant="label-default-s" onBackground="neutral-weak">
              {formatDate(post.metadata.publishedAt, false)}
            </Text>
            <Heading as="h2" variant="heading-strong-l" data-exclude-nav>
              {post.metadata.title}
            </Heading>
            <Text variant="body-default-s" onBackground="neutral-weak">
              {post.metadata.summary}
            </Text>
          </Card>
        ))}
      </Column>
    </Column>
  );
}
