import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostMeta = { slug: string; title: string; date: string; summary: string };

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function readMeta(file: string): PostMeta | null {
  const slug = path.basename(file, ".mdx");
  const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, file), "utf8"));
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? "");
  if (!data.title || !date || !data.summary) return null;
  return { slug, title: String(data.title), date, summary: String(data.summary) };
}

/** Every post in content/blog, newest first. */
export function listPosts(): PostMeta[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map(readMeta)
    .filter((post): post is PostMeta => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getPost(slug: string): PostMeta | null {
  if (!SLUG_PATTERN.test(slug)) return null;
  const file = `${slug}.mdx`;
  if (!fs.existsSync(path.join(BLOG_DIR, file))) return null;
  return readMeta(file);
}
