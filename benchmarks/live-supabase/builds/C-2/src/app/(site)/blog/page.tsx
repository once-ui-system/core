import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "News and updates from the Acme Notes team.",
};

export default async function BlogIndex() {
  const posts = await getPosts();
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
      <ul className="mt-8 space-y-8">
        {posts.map((p) => (
          <li key={p.slug}>
            <time dateTime={p.date} className="text-sm text-muted-foreground">{p.date}</time>
            <h2 className="text-xl font-semibold">
              <Link href={`/blog/${p.slug}`} className="hover:underline">{p.title}</Link>
            </h2>
            <p className="text-muted-foreground">{p.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
