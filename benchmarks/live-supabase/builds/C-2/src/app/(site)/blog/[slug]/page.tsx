import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPost, getPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/config";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: `${siteConfig.url}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      siteName: siteConfig.name,
    },
    twitter: { card: "summary", title: post.title, description: post.summary },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-16">
      <time dateTime={post.date} className="text-sm text-muted-foreground">{post.date}</time>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">{post.title}</h1>
      <div className="mt-6 space-y-4 text-muted-foreground [&_a]:text-primary [&_a]:underline">
        <MDXRemote source={post.body} />
      </div>
    </article>
  );
}
