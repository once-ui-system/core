import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, listPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return listPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Not found" };
  return pageMetadata({
    title: post.title,
    description: post.summary,
    path: `/blog/${post.slug}`,
    openGraph: { type: "article", publishedTime: post.date },
  });
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const { default: Content } = await import(`../../../../../content/blog/${post.slug}.mdx`);
  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-16">
      <p className="text-sm text-muted-foreground">
        <time dateTime={post.date}>{post.date}</time>
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{post.title}</h1>
      <div className="mt-8">
        <Content />
      </div>
    </article>
  );
}
