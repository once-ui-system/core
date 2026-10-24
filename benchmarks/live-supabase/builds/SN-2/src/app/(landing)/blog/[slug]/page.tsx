import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Meta,
  Schema,
  AvatarGroup,
  Button,
  Column,
  Grid,
  Heading,
  HeadingNav,
  Row,
  Text,
  Media,
} from "@once-ui-system/core";
import { CustomMDX } from "@/components";
import { Post } from "../components";
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
    image: post.metadata.image || `/api/og/generate?title=${post.metadata.title}`,
    path: `${landing.blog.path}/${post.slug}`,
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

  const avatars =
    post.metadata.team?.map((person) => ({
      src: person.avatar,
    })) || [];
  const authors = post.metadata.team?.length
    ? post.metadata.team.length <= 2
      ? post.metadata.team.map((person) => person.name).join(" and ")
      : `${post.metadata.team
          .map((person) => person.name)
          .slice(0, 2)
          .join(", ")} + ${post.metadata.team.length - 2} more`
    : null;
  const related = posts
    .filter((other) => other.slug !== post.slug)
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
    )
    .slice(0, 3);

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
        image={
          post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`
        }
        author={
          post.metadata.team && post.metadata.team.length > 0
            ? {
                name: post.metadata.team[0].name,
                url: `${baseURL}${landing.blog.path}`,
                image: `${baseURL}${post.metadata.team[0].avatar}`,
              }
            : undefined
        }
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
        {authors && (
          <Row gap="12" vertical="center">
            {avatars.length > 0 && <AvatarGroup reverse size="s" avatars={avatars} limit={2} />}
            <Text variant="label-default-m" onBackground="neutral-medium">
              {authors}
            </Text>
          </Row>
        )}
      </Column>
      {post.metadata.image && (
        <Column fillWidth maxWidth="l" paddingTop="48">
          <Media
            src={post.metadata.image}
            alt=""
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            aspectRatio="16 / 9"
            border="neutral-alpha-weak"
            radius="xl"
          />
        </Column>
      )}
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
      {related.length > 0 && (
        <Column fillWidth maxWidth="l" gap="24" paddingTop="104">
          <Heading as="h2" variant="heading-strong-xl" data-exclude-nav>
            Keep reading
          </Heading>
          <Grid fillWidth columns={3} m={{ columns: 2 }} s={{ columns: 1 }} gap="16">
            {related.map((other) => (
              <Post key={other.slug} post={other} thumbnail />
            ))}
          </Grid>
        </Column>
      )}
    </Column>
  );
}
