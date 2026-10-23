import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "src", "content", "blog");

export type PostMeta = { slug: string; title: string; date: string; summary: string };
export type Post = PostMeta & { body: string };

function parse(slug: string, raw: string): Post {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  const data: Record<string, string> = {};
  for (const line of (m ? m[1] : "").split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    summary: data.summary ?? "",
    body: m ? m[2] : raw,
  };
}

export function getPosts(): Post[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => parse(f.replace(/\.mdx$/, ""), fs.readFileSync(path.join(dir, f), "utf8")))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
