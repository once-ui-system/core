import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostMeta = { slug: string; title: string; date: string; summary: string };
export type Post = PostMeta & { body: string };

const DIR = path.join(process.cwd(), "src", "content", "blog");
const SLUG = /^[a-z0-9-]+$/;

function readPost(slug: string): Post | null {
  if (!SLUG.test(slug)) return null;
  const file = path.join(DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    slug,
    title: String(data.title),
    date: String(data.date),
    summary: String(data.summary),
    body: content,
  };
}

/** Every post in src/content/blog, newest first. */
export function getAllPosts(): PostMeta[] {
  return fs
    .readdirSync(DIR)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => readPost(name.replace(/\.mdx$/, "")))
    .filter((post): post is Post => post !== null)
    .map(({ body: _body, ...meta }) => meta)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getPost(slug: string): Post | null {
  return readPost(slug);
}
