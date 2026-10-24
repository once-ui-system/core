import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPost } from "../../../../lib/blog";
import { pageMetadata } from "../../../../lib/seo";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  return pageMetadata({
    title: post.title,
    description: post.summary,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.date,
  });
}

const mdxComponents = {
  h2: (props: { children?: React.ReactNode }) => (
    <Heading as="h2" variant="display-strong-xs" style={{ marginTop: "1rem" }}>
      {props.children}
    </Heading>
  ),
  p: (props: { children?: React.ReactNode }) => (
    <Text as="p" variant="body-default-l" onBackground="neutral-medium">
      {props.children}
    </Text>
  ),
};

export default async function BlogPost({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <Column horizontal="center" fillWidth paddingX="16" paddingY="64">
      <Column maxWidth="s" gap="24">
        <Column gap="8">
          <Text variant="label-default-s" onBackground="neutral-weak">
            {post.date}
          </Text>
          <Heading as="h1" variant="display-strong-s">
            {post.title}
          </Heading>
          <Text as="p" variant="heading-default-s" onBackground="neutral-medium">
            {post.summary}
          </Text>
        </Column>
        <Column gap="16">
          <MDXRemote source={post.body} components={mdxComponents} />
        </Column>
      </Column>
    </Column>
  );
}
