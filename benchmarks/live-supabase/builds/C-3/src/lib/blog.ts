import fs from "node:fs";
import path from "node:path";

export type PostMeta = { title: string; date: string; summary: string };

const dir = path.join(process.cwd(), "src/content/blog");

export function postSlugs(): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export async function loadPost(slug: string) {
  if (!postSlugs().includes(slug)) return null;
  const mod = await import(`@/content/blog/${slug}.mdx`);
  return { slug, meta: mod.meta as PostMeta, Content: mod.default as React.ComponentType };
}

export async function allPosts() {
  const posts = await Promise.all(postSlugs().map(loadPost));
  return posts
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .sort((a, b) => b.meta.date.localeCompare(a.meta.date));
}
