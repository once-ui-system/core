import type { Metadata } from "next";
import Link from "next/link";
import { allPosts } from "@/lib/blog";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const title = "Blog";
const description = "News and notes from the Acme Notes team.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog" },
  openGraph: { title: "Blog | Acme Notes", description, url: "/blog", type: "website" },
};

export default async function BlogIndex() {
  const posts = await allPosts();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-3 text-muted-foreground">{description}</p>
        <ul className="mt-10 space-y-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="block">
                <Card className="transition-colors hover:ring-brand">
                  <CardHeader>
                    <time dateTime={post.date} className="text-xs text-muted-foreground">
                      {post.date}
                    </time>
                    <CardTitle className="text-xl">{post.title}</CardTitle>
                    <CardDescription>{post.summary}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
