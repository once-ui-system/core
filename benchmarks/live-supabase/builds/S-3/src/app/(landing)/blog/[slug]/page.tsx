import { CustomMDX } from "@/components";
import { baseURL, landing } from "@/resources";
import { formatDate } from "@/utils";
import { getPosts } from "@/utils/utils";
import { Button, Column, Heading, Meta, Schema, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPosts().find((p) => p.slug === slug);
  if (!post) return {};

  const path = `${landing.blog.path}/${post.slug}`;
  const meta = Meta.generate({
    title: post.metadata.title,
    description: post.metadata.summary,
    baseURL: baseURL,
    image: `/api/og?title=${encodeURIComponent(post.metadata.title)}`,
    path,
  });
  return {
    ...meta,
    openGraph: { ...(meta.openGraph ?? {}), type: "article", publishedTime: post.metadata.publishedAt },
  };
}

export default async function Post({ params }: Params) {
  const { slug } = await params;
  const post = getPosts().find((p) => p.slug === slug);
  if (!post) notFound();

  const path = `${landing.blog.path}/${post.slug}`;
  return (
    <Column fillWidth horizontal="center" paddingX="l" s={{ paddingX: "16" }}>
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        path={path}
        title={post.metadata.title}
        description={post.metadata.summary}
        datePublished={post.metadata.publishedAt}
        dateModified={post.metadata.publishedAt}
        image={`/api/og?title=${encodeURIComponent(post.metadata.title)}`}
        author={{ name: "Acme Notes", url: `${baseURL}${landing.blog.path}`, image: "" }}
      />
      <Column fillWidth maxWidth="s" gap="24" paddingTop="32">
        <Button href={landing.blog.path} variant="tertiary" size="s" prefixIcon="chevronLeft">
          All posts
        </Button>
        <Text variant="label-default-s" onBackground="neutral-weak">
          {formatDate(post.metadata.publishedAt)}
        </Text>
        <Heading as="h1" variant="display-strong-m" wrap="balance">
          {post.metadata.title}
        </Heading>
        <Text variant="body-default-xl" onBackground="neutral-weak" wrap="balance">
          {post.metadata.summary}
        </Text>
        <Column as="article" fillWidth>
          <CustomMDX source={post.content} />
        </Column>
      </Column>
    </Column>
  );
}
