import type { Metadata } from "next";
import Link from "next/link";
import { allPosts } from "@/lib/blog";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Blog",
  description: `News and updates from ${siteConfig.name}.`,
};

export default async function BlogIndex() {
  const posts = await allPosts();
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold">Blog</h1>
      <ul className="mt-8 flex flex-col gap-6">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="text-xl font-semibold hover:underline">
              {p.meta.title}
            </Link>
            <p className="text-sm text-muted-foreground">{p.meta.date}</p>
            <p className="mt-1">{p.meta.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
