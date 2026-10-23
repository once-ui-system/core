import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

/** Every MDX post in src/content/blog, newest first. */
export function getPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
      const { data, content } = matter(raw);
      const published = data.publishedAt as unknown;
      return {
        slug: file.replace(/\.mdx$/, ""),
        title: String(data.title ?? ""),
        summary: String(data.summary ?? ""),
        // gray-matter parses a bare YYYY-MM-DD into a Date; keep the string.
        publishedAt:
          published instanceof Date ? published.toISOString().slice(0, 10) : String(published ?? ""),
        content,
      };
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPost(slug: string): BlogPost | undefined {
  return getPosts().find((post) => post.slug === slug);
}
