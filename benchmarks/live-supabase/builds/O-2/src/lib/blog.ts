import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const dir = path.join(process.cwd(), "src/content/blog");

export type Post = { slug: string; title: string; date: string; summary: string; body: string };

export function getPosts(): Post[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      return {
        slug: f.replace(/\.mdx$/, ""),
        title: String(data.title),
        date: new Date(data.date).toISOString().slice(0, 10),
        summary: String(data.summary ?? ""),
        body: content,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug);
