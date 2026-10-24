import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button, Column, Heading, Text } from "@once-ui-system/core";
import { PostBody } from "@/components/Mdx";
import { formatPostDate, getPost, getPosts } from "@/lib/blog";
import { baseURL, defaultImage, landing } from "@/resources";
import { pageMetadata } from "@/lib/meta";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const path = `${landing.blog.path}/${post.slug}`;
  return pageMetadata(
    {
      title: post.title,
      description: post.summary,
      path,
      canonical: `${baseURL}${path}`,
      image: defaultImage,
    },
    { type: "article", publishedTime: post.publishedAt },
  );
}

export default async function BlogPost({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <Column as="article" fillWidth maxWidth="s" gap="24" horizontal="center">
      <Button href="/blog" label="All posts" variant="tertiary" size="s" prefixIcon="chevronLeft" />
      <Column gap="8">
        <Text variant="label-default-s" onBackground="neutral-weak">
          {formatPostDate(post.publishedAt)}
        </Text>
        <Heading as="h1" variant="display-strong-s">
          {post.title}
        </Heading>
        <Text variant="heading-default-m" onBackground="neutral-medium">
          {post.summary}
        </Text>
      </Column>
      <PostBody source={post.body} />
    </Column>
  );
}
