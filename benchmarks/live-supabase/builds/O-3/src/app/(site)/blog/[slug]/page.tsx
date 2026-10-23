import { Button, Column, Heading, Text } from "@once-ui-system/core";
import { mdxComponents } from "@once-ui-system/core/mdx";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { formatDate, getPost, getPosts } from "@/lib/blog";
import { brand } from "@/resources/once-ui.config";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const url = `${brand.url}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      siteName: brand.name,
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
    },
    twitter: { card: "summary", title: post.title, description: post.summary },
  };
}

export default async function Post({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return (
    <Column maxWidth="s" fillWidth gap="24" paddingY="64">
      <Button href="/blog" variant="tertiary" size="s" prefixIcon="chevronLeft" label="Blog" />
      <Column gap="8">
        <Text variant="label-default-s" onBackground="neutral-weak">
          {formatDate(post.date)}
        </Text>
        <Heading variant="display-strong-s" as="h1">
          {post.title}
        </Heading>
        <Text variant="heading-default-m" onBackground="neutral-weak">
          {post.summary}
        </Text>
      </Column>
      <Column gap="16">
        <MDXRemote source={post.body} components={mdxComponents} />
      </Column>
    </Column>
  );
}
