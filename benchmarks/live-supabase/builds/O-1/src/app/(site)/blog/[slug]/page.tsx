import { Column, Heading, SmartLink, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { brand, seo } from "../../../../resources/config";
import { formatDate, getPost, getPosts } from "../../../../lib/blog";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: `${brand.url}/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
      siteName: brand.name,
      images: [seo.ogImage],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary },
  };
}

const components = {
  p: (props: React.ComponentProps<"p">) => <Text as="p" variant="body-default-l" onBackground="neutral-weak" {...(props as object)} />,
};

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  return (
    <Column as="article" fillWidth maxWidth="s" gap="24">
      <SmartLink href="/blog">← Blog</SmartLink>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-s">
          {post.title}
        </Heading>
        <Text variant="label-default-s" onBackground="neutral-weak">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </Text>
      </Column>
      <Column gap="16">
        <MDXRemote source={post.body} components={components} />
      </Column>
    </Column>
  );
}
