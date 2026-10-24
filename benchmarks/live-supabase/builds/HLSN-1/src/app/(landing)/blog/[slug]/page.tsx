import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Column, Heading, Text } from "@once-ui-system/core";
import { getPost, getPosts } from "@/lib/blog";
import { baseURL, schema } from "@/resources";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const path = `/blog/${post.slug}`;
  return {
    metadataBase: new URL(baseURL),
    title: `${post.title} - ${schema.name}`,
    description: post.summary,
    alternates: { canonical: path },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: path,
      type: "article",
      publishedTime: post.publishedAt,
      images: ["/images/og/home.jpg"],
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <Column as="article" fillWidth maxWidth="s" gap="24">
      <Column gap="8">
        <Text variant="label-default-s" onBackground="neutral-weak">
          {post.publishedAt}
        </Text>
        <Heading as="h1" variant="display-strong-s">
          {post.title}
        </Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          {post.summary}
        </Text>
      </Column>
      <Column gap="16" className="blog-body">
        <Text as="div" variant="body-default-m">
          <MDXRemote source={post.content} />
        </Text>
      </Column>
    </Column>
  );
}
