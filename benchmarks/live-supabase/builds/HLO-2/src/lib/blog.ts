import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Post = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  content: string;
};

const DIR = path.join(process.cwd(), "content", "blog");

// Every .mdx file in content/blog, newest first. The filename is the slug.
export function getAllPosts(): Post[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => readPost(file))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getPost(slug: string): Post | undefined {
  if (!/^[a-z0-9-]+$/.test(slug)) return undefined;
  const file = path.join(DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return undefined;
  return readPost(`${slug}.mdx`);
}

function readPost(file: string): Post {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  return {
    slug: file.replace(/\.mdx$/, ""),
    title: String(data.title ?? ""),
    date: String(data.date ?? ""),
    summary: String(data.summary ?? ""),
    content,
  };
}
