import fs from "node:fs";
import path from "node:path";
import type { ComponentType } from "react";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
};

type PostModule = {
  default: ComponentType;
  meta: Omit<PostMeta, "slug">;
};

const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

// Slugs are the file names of the MDX posts in src/content/blog.
export function postSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.slice(0, -".mdx".length))
    .sort();
}

export async function loadPost(slug: string): Promise<PostModule | null> {
  if (!postSlugs().includes(slug)) return null;
  return (await import(`../content/blog/${slug}.mdx`)) as PostModule;
}

// Every post's metadata, newest first.
export async function allPosts(): Promise<PostMeta[]> {
  const posts = await Promise.all(
    postSlugs().map(async (slug) => {
      const post = await loadPost(slug);
      return { slug, ...(post?.meta ?? { title: slug, date: "", summary: "" }) };
    })
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}
