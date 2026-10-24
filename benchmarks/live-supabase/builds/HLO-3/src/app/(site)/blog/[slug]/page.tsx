import { Button, Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };
  return pageMetadata(post.meta.title, post.meta.summary, `/blog/${slug}`, {
    type: "article",
    publishedTime: post.meta.date,
  });
}

export default async function BlogPost({ params }: Params) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <Column as="article" gap="24">
      <Button href="/blog" variant="link" label="All posts" prefixIcon="chevronLeft" size="s" />
      <Column gap="8">
        <Text variant="label-default-s" onBackground="neutral-weak">
          <time dateTime={post.meta.date}>{post.meta.date}</time>
        </Text>
        <Heading as="h1" variant="display-strong-m">
          {post.meta.title}
        </Heading>
        <Text variant="heading-default-s" onBackground="neutral-weak">
          {post.meta.summary}
        </Text>
      </Column>
      <Column gap="16" textVariant="body-default-l">
        {post.content}
      </Column>
    </Column>
  );
}
