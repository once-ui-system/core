import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Meta,
  Schema,
  Button,
  Column,
  Heading,
  HeadingNav,
  Row,
  Text,
} from "@once-ui-system/core";
import { CustomMDX } from "@/components";
import { baseURL, landing } from "@/resources";
import { formatDate } from "@/utils";
import { getPosts } from "@/utils/utils";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await getPosts(["src", "content", "blog"]);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  const posts = await getPosts(["src", "content", "blog"]);
  const post = posts.find((post) => post.slug === slugPath);

  if (!post) return {};

  return Meta.generate({
    title: post.metadata.title,
    description: post.metadata.summary,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`,
    path: `${landing.blog.path}/${post.slug}`,
    type: "article",
    publishedTime: post.metadata.publishedAt,
  });
}

export default async function Blog({ params }: { params: Promise<{ slug: string | string[] }> }) {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  const posts = await getPosts(["src", "content", "blog"]);
  const post = posts.find((post) => post.slug === slugPath);

  if (!post) {
    notFound();
  }

  return (
    <Column fillWidth horizontal="center" paddingX="l" s={{ paddingX: "16" }}>
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        path={`${landing.blog.path}/${post.slug}`}
        title={post.metadata.title}
        description={post.metadata.summary}
        datePublished={post.metadata.publishedAt}
        dateModified={post.metadata.publishedAt}
        image={`/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`}
      />
      <Column fillWidth maxWidth="m" horizontal="center" gap="24" paddingTop="32">
        <Button href={landing.blog.path} variant="tertiary" size="s" prefixIcon="chevronLeft">
          All posts
        </Button>
        <Row gap="8" vertical="center" textVariant="label-default-s" onBackground="neutral-weak">
          {post.metadata.tag && (
            <Text variant="label-strong-s" onBackground="brand-medium">
              {post.metadata.tag}
            </Text>
          )}
          {post.metadata.tag && <Text aria-hidden>·</Text>}
          <Text>{post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}</Text>
        </Row>
        <Heading as="h1" variant="display-strong-m" align="center" wrap="balance">
          {post.metadata.title}
        </Heading>
        {post.metadata.summary && (
          <Text variant="body-default-xl" onBackground="neutral-weak" align="center" wrap="balance">
            {post.metadata.summary}
          </Text>
        )}
      </Column>
      <Row fillWidth maxWidth="l" paddingTop="64" horizontal="center" gap="40">
        <Row flex={1} maxWidth={14} m={{ hide: true }} />
        <Column as="article" fillWidth maxWidth="s">
          <CustomMDX source={post.content} />
        </Column>
        <Column
          flex={1}
          maxWidth={14}
          fitHeight
          position="sticky"
          top="128"
          gap="16"
          m={{ hide: true }}
        >
          <HeadingNav fitHeight />
        </Column>
      </Row>
    </Column>
  );
}
