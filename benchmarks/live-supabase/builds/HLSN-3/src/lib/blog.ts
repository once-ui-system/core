import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Post = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  body: string;
};

const DIR = path.join(process.cwd(), "src", "content", "blog");

function readPost(file: string): Post {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  return {
    slug: file.replace(/\.mdx$/, ""),
    title: String(data.title ?? ""),
    summary: String(data.summary ?? ""),
    publishedAt: String(data.publishedAt ?? ""),
    body: content,
  };
}

/** Every post in src/content/blog, newest first. */
export function getPosts(): Post[] {
  return fs
    .readdirSync(DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map(readPost)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPost(slug: string): Post | null {
  return getPosts().find((post) => post.slug === slug) ?? null;
}

/** A calendar date as the blog shows it, without a timezone shift. */
export function formatPostDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
