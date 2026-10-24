import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/** The blog's posts: MDX files in src/content/blog, newest first. */
export type Post = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  content: string;
};

const DIR = path.join(process.cwd(), "src", "content", "blog");

function readPost(file: string): Post {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  return {
    slug: file.replace(/\.mdx$/, ""),
    title: String(data.title),
    summary: String(data.summary),
    publishedAt: String(data.publishedAt),
    content,
  };
}

export function getPosts(): Post[] {
  return fs
    .readdirSync(DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map(readPost)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((post) => post.slug === slug);
}
