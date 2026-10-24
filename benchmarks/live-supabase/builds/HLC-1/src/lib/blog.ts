import { readdirSync } from "node:fs";
import { join } from "node:path";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
};

const contentDir = join(process.cwd(), "src", "content", "blog");

export function postSlugs(): string[] {
  return readdirSync(contentDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

// Frontmatter is read from each MDX file (remark-mdx-frontmatter exports it).
export async function loadPostMeta(slug: string): Promise<PostMeta> {
  const mod = await import(`@/content/blog/${slug}.mdx`);
  const fm = mod.frontmatter as { title: string; date: string; summary: string };
  return { slug, title: fm.title, date: fm.date, summary: fm.summary };
}

export async function allPosts(): Promise<PostMeta[]> {
  const posts = await Promise.all(postSlugs().map(loadPostMeta));
  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
