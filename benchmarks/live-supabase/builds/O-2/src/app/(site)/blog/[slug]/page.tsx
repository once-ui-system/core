import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "../../../../lib/blog";
import { brand } from "../../../../resources/config";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url: `${brand.url}/blog/${post.slug}`,
      siteName: brand.name,
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
    },
    twitter: { card: "summary", title: post.title, description: post.summary },
  };
}

const components = {
  p: (props: React.ComponentProps<"p">) => <Text as="p" variant="body-default-l" {...(props as object)} />,
};

export default async function PostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return (
    <Column as="main" fillWidth horizontal="center" paddingX="16" paddingY="64">
      <Column as="article" maxWidth="s" fillWidth gap="24">
        <Text variant="label-default-s" onBackground="neutral-weak">
          <time dateTime={post.date}>{post.date}</time>
        </Text>
        <Heading as="h1" variant="display-strong-s">
          {post.title}
        </Heading>
        <MDXRemote source={post.body} components={components} />
        <a href="/blog">Back to the blog</a>
      </Column>
    </Column>
  );
}
