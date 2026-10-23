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
    robots: landing.blog.robots,
    alternates: landing.blog.alternates,
  });
}

export default async function Blog() {
  const posts = (await getPosts(["src", "content", "blog"])).sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
  );

  return (
    <Column fillWidth maxWidth="m" horizontal="center" paddingX="l" gap="32" s={{ paddingX: "16" }}>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={landing.blog.title}
        description={landing.blog.description}
        path={landing.blog.path}
      />
      <Column fillWidth gap="12" paddingTop="32">
        <Heading as="h1" variant="display-strong-s">
          Blog
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          News and updates from the Acme Notes team.
        </Text>
      </Column>
      <Column fillWidth gap="16">
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
            <Heading as="h2" variant="heading-strong-l">
              {post.metadata.title}
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {post.metadata.summary}
            </Text>
          </Card>
        ))}
      </Column>
    </Column>
  );
}
