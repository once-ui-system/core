import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Blog posts: one MDX file per post in src/content/posts. The frontmatter sets
 * title, summary and publishedAt (quoted ISO date); the file name is the slug.
 */
export type Post = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  content: string;
};

const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

/** Every post, newest first. */
export function getPosts(): Post[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf-8"));
      return {
        slug: file.replace(/\.mdx$/, ""),
        title: String(data.title ?? ""),
        summary: String(data.summary ?? ""),
        publishedAt: String(data.publishedAt ?? ""),
        content,
      };
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** One post by slug, or null. */
export function getPost(slug: string): Post | null {
  return getPosts().find((post) => post.slug === slug) ?? null;
}
