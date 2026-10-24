import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPost } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { brand, seo } from "@/resources/once-ui.config";


type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  const url = `${seo.url}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      url,
      siteName: brand.name,
      locale: seo.locale,
      publishedTime: post.date,
    },
  };
}

const mdxComponents = {
  h2: (props: React.ComponentProps<"h2">) => (
    <Heading as="h2" variant="heading-strong-l">
      {props.children}
    </Heading>
  ),
  p: (props: React.ComponentProps<"p">) => (
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
    <Column as="article" maxWidth="s" paddingX="24" paddingY="64" gap="32">
      <Column gap="12">
        <Text variant="label-default-s" onBackground="brand-medium">
          {formatDate(post.date)}
        </Text>
        <Heading as="h1" variant="display-strong-m">
          {post.title}
        </Heading>
        <Text as="p" variant="heading-default-s" onBackground="neutral-medium">
          {post.summary}
        </Text>
      </Column>
      <Column gap="16">
        <MDXRemote source={post.content} components={mdxComponents} />
      </Column>
    </Column>
  );
}
