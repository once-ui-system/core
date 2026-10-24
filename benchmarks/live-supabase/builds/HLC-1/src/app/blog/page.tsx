import Link from "next/link";
import type { Metadata } from "next";
import { allPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const title = "Blog";
const description = "News and notes from the Acme Notes team.";

export const metadata: Metadata = pageMetadata({ title, description, path: "/blog", openGraph: true });

export default async function BlogIndex() {
  const posts = await allPosts();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
        <ul className="mt-10 divide-y divide-border">
          {posts.map((post) => (
            <li key={post.slug} className="py-6">
              <time dateTime={post.date} className="text-sm text-muted-foreground">
                {post.date}
              </time>
              <h2 className="mt-1 text-xl font-semibold">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-muted-foreground">{post.summary}</p>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
