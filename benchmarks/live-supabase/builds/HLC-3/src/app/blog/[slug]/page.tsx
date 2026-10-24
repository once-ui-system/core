import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadPost, postSlugs } from "@/lib/blog";
import { site } from "@/config/site";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return postSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: "Not found" };
  const { title, summary, date } = post.meta;
  const url = `/blog/${slug}`;
  return {
    title,
    description: summary,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${site.name}`,
      description: summary,
      url,
      type: "article",
      publishedTime: date,
      siteName: site.name,
    },
  };
}

export default async function BlogPost({ params }: Params) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();
  const { title, date, summary } = post.meta;
  const Body = post.default;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16">
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
          ← All posts
        </Link>
        <article className="mt-6">
          <time dateTime={date} className="text-sm text-muted-foreground">
            {date}
          </time>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-4 text-lg text-foreground">{summary}</p>
          <div className="mt-6">
            <Body />
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
