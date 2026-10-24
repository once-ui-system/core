import { Button, Column, Heading, Text } from "@once-ui-system/core";
import { formatPostDate, getPosts } from "@/lib/blog";
import { landing } from "@/resources";
import { pageMetadata } from "@/lib/meta";

export function generateMetadata() {
  return pageMetadata({
    title: landing.blog.title,
    description: landing.blog.description,
    path: landing.blog.path,
    canonical: landing.blog.canonical,
    image: landing.blog.image,
    robots: landing.blog.robots,
    alternates: landing.blog.alternates,
  });
}

export default function BlogIndex() {
  const posts = getPosts();
  return (
    <Column as="section" fillWidth gap="32">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          Blog
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-medium">
          News and guides from the Acme Notes team.
        </Text>
      </Column>
      <Column gap="16" as="ul">
        {posts.map((post) => (
          <Column
            as="li"
            key={post.slug}
            background="surface"
            border
            radius="l"
            padding="24"
            gap="8"
          >
            <Text variant="label-default-s" onBackground="neutral-weak">
              {formatPostDate(post.publishedAt)}
            </Text>
            <Heading as="h2" variant="heading-strong-l">
              {post.title}
            </Heading>
            <Text variant="body-default-m" onBackground="neutral-medium">
              {post.summary}
            </Text>
            <Button href={`/blog/${post.slug}`} label="Read the post" variant="tertiary" size="s" />
          </Column>
        ))}
      </Column>
    </Column>
  );
}
