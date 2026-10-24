import { Column, Heading, Meta, Row, Schema, SmartLink, Text } from "@once-ui-system/core";
import { baseURL, landing } from "@/resources";
import { getPosts } from "@/lib/content";

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

/** Every post, newest first. */
export default function BlogIndex() {
  const posts = getPosts();
  return (
    <Column fillWidth gap="32" paddingY="48">
      <Schema as="webPage" baseURL={baseURL} title={landing.blog.title} description={landing.blog.description} path={landing.blog.path} />
      <Heading as="h1" variant="display-strong-s">
        Blog
      </Heading>
      <Column fillWidth gap="24">
        {posts.map((post) => (
          <Column key={post.slug} gap="8" fillWidth>
            <Row gap="8" textVariant="label-default-s" onBackground="neutral-weak">
              <Text>{post.publishedAt}</Text>
            </Row>
            <SmartLink href={`/blog/${post.slug}`}>
              <Heading as="h2" variant="heading-strong-l">
                {post.title}
              </Heading>
            </SmartLink>
            <Text variant="body-default-m" onBackground="neutral-weak">
              {post.summary}
            </Text>
          </Column>
        ))}
      </Column>
    </Column>
  );
}
