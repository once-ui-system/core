import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadPost, postSlugs } from "@/lib/blog";
import { siteConfig } from "@/config/site";

export function generateStaticParams() {
  return postSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await loadPost((await params).slug);
  if (!post) return {};
  const url = `${siteConfig.url}/blog/${post.slug}`;
  return {
    title: post.meta.title,
    description: post.meta.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      siteName: siteConfig.name,
      title: post.meta.title,
      description: post.meta.summary,
      publishedTime: post.meta.date,
    },
    twitter: { card: "summary", title: post.meta.title, description: post.meta.summary },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = await loadPost((await params).slug);
  if (!post) notFound();
  const { Content, meta } = post;
  return (
    <article className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold">{meta.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        <time dateTime={meta.date}>{meta.date}</time>
      </p>
      <Content />
    </article>
  );
}
