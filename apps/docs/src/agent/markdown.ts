import { readFileSync } from "node:fs";
import path from "node:path";
import { getPages } from "@/app/utils/utils";
import { baseURL, schema } from "@/resources";

const STATIC_MARKDOWN: Record<string, string> = {
  "/changelog": `# Changelog

Release history for ${schema.name}. Open ${baseURL}/changelog in a browser for the full interactive changelog.
`,
  "/roadmap": `# Roadmap

Planned features and progress for ${schema.name}. Open ${baseURL}/roadmap in a browser for the full roadmap.
`,
};

export function getMarkdownForPath(pathname: string): string | null {
  const normalized = pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;

  if (normalized === "/") {
    const llmsPath = path.join(process.cwd(), "public", "llms.txt");
    return readFileSync(llmsPath, "utf8");
  }

  if (STATIC_MARKDOWN[normalized]) {
    return STATIC_MARKDOWN[normalized];
  }

  const slug = normalized.slice(1);
  if (!slug) return null;

  const page = getPages().find((doc) => doc.slug === slug);
  if (!page) return null;

  const lines = [
    `# ${page.metadata.title}`,
    "",
    page.metadata.summary ? `> ${page.metadata.summary}` : null,
    page.metadata.updatedAt ? `Updated: ${page.metadata.updatedAt}` : null,
    "",
    page.content.trim(),
  ].filter((line): line is string => line != null && line !== "");

  return `${lines.join("\n")}\n`;
}

export function acceptsMarkdown(acceptHeader: string | null): boolean {
  if (!acceptHeader) return false;
  return acceptHeader.split(",").some((part) => {
    const value = part.split(";")[0]?.trim().toLowerCase();
    return value === "text/markdown" || value === "text/x-markdown";
  });
}
