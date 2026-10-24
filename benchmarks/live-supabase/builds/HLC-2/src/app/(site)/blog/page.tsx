import Link from "next/link";
import { site } from "@/config/site";
import { listPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog",
  description: `News and notes from ${site.name}.`,
  path: "/blog",
  openGraph: true,
});

export default function BlogIndex() {
  const posts = listPosts();
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
      <ul className="mt-10 flex flex-col divide-y divide-border">
        {posts.map((post) => (
          <li key={post.slug} className="py-6">
            <time dateTime={post.date} className="text-sm text-muted-foreground">
              {post.date}
            </time>
            <h2 className="mt-1 text-xl font-semibold">
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-muted-foreground">{post.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
