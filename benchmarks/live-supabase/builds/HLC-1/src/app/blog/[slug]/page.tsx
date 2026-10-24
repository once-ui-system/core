import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPostMeta, postSlugs } from "@/lib/blog";
import { site } from "@/config/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return postSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPostMeta(slug).catch(() => null);
  if (!post) return {};
  const path = `/blog/${post.slug}`;
  return {
    title: { absolute: `${post.title} | ${site.name}` },
    description: post.summary,
    alternates: { canonical: path },
    openGraph: {
      title: post.title,
      description: post.summary,
      url: path,
      siteName: site.name,
      locale: site.locale,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await loadPostMeta(slug).catch(() => null);
  if (!post) notFound();
  const { default: Content } = await import(`@/content/blog/${slug}.mdx`);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
          ← All posts
        </Link>
        <article className="mt-8">
          <time dateTime={post.date} className="text-sm text-muted-foreground">
            {post.date}
          </time>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{post.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.summary}</p>
          <div className="mt-6">
            <Content />
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
