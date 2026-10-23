import fs from "node:fs/promises";
import path from "node:path";

const dir = path.join(process.cwd(), "src", "content", "blog");

export type Post = { slug: string; title: string; date: string; summary: string; body: string };

function parse(slug: string, raw: string): Post {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const meta: Record<string, string> = {};
  for (const line of (m?.[1] ?? "").split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i < 0) continue;
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  return { slug, title: meta.title ?? slug, date: meta.date ?? "", summary: meta.summary ?? "", body: m?.[2] ?? raw };
}

export async function getPosts(): Promise<Post[]> {
  "use cache";
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".mdx"));
  const posts = await Promise.all(
    files.map(async (f) => parse(f.replace(/\.mdx$/, ""), await fs.readFile(path.join(dir, f), "utf8")))
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<Post | null> {
  "use cache";
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    return parse(slug, await fs.readFile(path.join(dir, `${slug}.mdx`), "utf8"));
  } catch {
    return null;
  }
}
