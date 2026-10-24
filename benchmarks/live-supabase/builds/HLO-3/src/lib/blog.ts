import { compileMDX } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = { slug: string; title: string; date: string; summary: string };

function metaFrom(slug: string, data: Record<string, unknown>): PostMeta {
  // YAML turns an unquoted 2026-10-01 into a Date; keep the calendar day.
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? "");
  return {
    slug,
    title: String(data.title ?? slug),
    date,
    summary: String(data.summary ?? ""),
  };
}

/** Every post in content/blog, newest first. */
export async function getPosts(): Promise<PostMeta[]> {
  const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith(".mdx"));
  const posts = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(BLOG_DIR, file), "utf8");
      return metaFrom(file.replace(/\.mdx$/, ""), matter(raw).data);
    }),
  );
  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export async function getPost(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  let raw: string;
  try {
    raw = await readFile(path.join(BLOG_DIR, `${slug}.mdx`), "utf8");
  } catch {
    return null;
  }
  const { content, data } = matter(raw);
  const { content: body } = await compileMDX({ source: content, options: { parseFrontmatter: false } });
  return { meta: metaFrom(slug, data), content: body };
}
