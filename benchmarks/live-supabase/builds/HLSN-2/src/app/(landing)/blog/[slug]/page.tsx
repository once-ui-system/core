import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Column, Heading, Meta, Row, Schema, SmartLink, Text } from "@once-ui-system/core";
import { CustomMDX } from "@/components";
import { baseURL, landing } from "@/resources";
import { getPost, getPosts } from "@/lib/content";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const path = `${landing.blog.path}/${post.slug}`;
  return Meta.generate({
    title: `${post.title} - Acme Notes`,
    description: post.summary,
    baseURL: baseURL,
    path,
    canonical: `${baseURL}${path}`,
    image: landing.home.image,
    type: "article",
    robots: "index,follow",
  });
}

/** One post, statically generated from its MDX file. */
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const path = `${landing.blog.path}/${post.slug}`;
  return (
    <Column fillWidth maxWidth="s" gap="24" paddingY="48">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        path={path}
        title={post.title}
        description={post.summary}
        datePublished={post.publishedAt}
        dateModified={post.publishedAt}
        image={landing.home.image}
      />
      <SmartLink href="/blog">
        <Text variant="label-default-s">All posts</Text>
      </SmartLink>
      <Row gap="8" textVariant="label-default-s" onBackground="neutral-weak">
        <Text>{post.publishedAt}</Text>
      </Row>
      <Heading as="h1" variant="display-strong-s">
        {post.title}
      </Heading>
      <Text variant="body-default-l" onBackground="neutral-weak">
        {post.summary}
      </Text>
      <Column as="article" fillWidth>
        <CustomMDX source={post.content} />
      </Column>
    </Column>
  );
}
