import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogPost = {
  metadata: { title: string; publishedAt: string; summary: string };
  slug: string;
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

/** Every MDX post in the content folder, newest first. */
export function getPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => path.extname(file) === ".mdx")
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, file), "utf-8"));
      const publishedAt =
        data.publishedAt instanceof Date
          ? data.publishedAt.toISOString().slice(0, 10)
          : String(data.publishedAt ?? "");
      return {
        slug: path.basename(file, ".mdx"),
        content,
        metadata: { title: data.title ?? "", summary: data.summary ?? "", publishedAt },
      };
    })
    .sort((a, b) => b.metadata.publishedAt.localeCompare(a.metadata.publishedAt));
}
