import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/site/header";
import { loadPost, postSlugs } from "@/lib/blog";
import { siteConfig } from "@/config/site";

export function generateStaticParams() {
  return postSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.summary,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.meta.title,
      description: post.meta.summary,
      url: `${siteConfig.url}/blog/${slug}`,
      siteName: siteConfig.name,
      type: "article",
      publishedTime: post.meta.date,
    },
    twitter: { card: "summary", title: post.meta.title, description: post.meta.summary },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();
  const { Content, meta } = post;
  return (
    <PageShell>
      <article className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">{meta.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          <time dateTime={meta.date}>{meta.date}</time>
        </p>
        <div className="mt-6">
          <Content />
        </div>
      </article>
    </PageShell>
  );
}
