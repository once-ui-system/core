import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/header";
import { allPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "News and updates from the Acme Notes team.",
};

export default async function BlogIndex() {
  const posts = await allPosts();
  return (
    <PageShell>
      <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
      <ul className="mt-8 divide-y divide-border">
        {posts.map((p) => (
          <li key={p.slug} className="py-5">
            <Link href={`/blog/${p.slug}`} className="text-xl font-semibold hover:text-primary">
              {p.meta.title}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              <time dateTime={p.meta.date}>{p.meta.date}</time>
            </p>
            <p className="mt-2 text-muted-foreground">{p.meta.summary}</p>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
