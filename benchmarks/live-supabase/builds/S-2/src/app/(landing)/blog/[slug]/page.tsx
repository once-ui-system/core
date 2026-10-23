import { CustomMDX } from "@/components";
import { getPost, getPosts } from "@/lib/blog";
import { baseURL, landing } from "@/resources";
import { formatDate } from "@/utils";
import { Button, Column, Heading, Meta, Schema, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return Meta.generate({
    title: `${post.title} - Acme Notes`,
    description: post.summary,
    baseURL: baseURL,
    path: `${landing.blog.path}/${post.slug}`,
    canonical: `${baseURL}${landing.blog.path}/${post.slug}`,
    image: landing.blog.image,
    robots: landing.blog.robots,
  });
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <Column fillWidth maxWidth="s" gap="24" paddingX="l" s={{ paddingX: "16" }}>
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        path={`${landing.blog.path}/${post.slug}`}
        title={post.title}
        description={post.summary}
        datePublished={post.publishedAt}
        dateModified={post.publishedAt}
        image={landing.blog.image}
        author={{ name: "Acme Notes", url: baseURL, image: `${baseURL}${landing.blog.image}` }}
      />
      <Button href={landing.blog.path} variant="tertiary" size="s" prefixIcon="chevronLeft">
        All posts
      </Button>
      <Text variant="label-default-s" onBackground="neutral-weak">
        {formatDate(post.publishedAt)}
      </Text>
      <Heading as="h1" variant="display-strong-m" wrap="balance">
        {post.title}
      </Heading>
      <Text variant="body-default-xl" onBackground="neutral-weak" wrap="balance">
        {post.summary}
      </Text>
      <Column as="article" fillWidth>
        <CustomMDX source={post.content} />
      </Column>
    </Column>
  );
}
