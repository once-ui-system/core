import fs from "node:fs";
import path from "node:path";
import type { DocsLinks } from "./BlockDocsLinks";

/** Sections searched in this order, so a name documented twice links to the component page. */
const SECTIONS = [
  "components",
  "effects",
  "modules",
  "form-controls",
  "data",
  "contexts",
  "hooks",
  "utils",
];

/** Lower-cased component name → the page (also lower-cased) that documents it. */
const ALIASES: Record<string, string> = { row: "flex", column: "flex" };

let cached: DocsLinks | undefined;

/**
 * Maps each documented component to its docs route by reading the content tree
 * (`content/effects/tiltFx.mdx` → `tiltfx: /effects/tiltFx`). Native docs are
 * left out: a web block links to web docs.
 */
export function getComponentDocsLinks(): DocsLinks {
  if (cached && process.env.NODE_ENV === "production") return cached;
  const contentDir = path.join(process.cwd(), "src", "content");
  const links: DocsLinks = {};
  for (const section of SECTIONS) {
    const dir = path.join(contentDir, section);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".mdx")) continue;
      const slug = file.replace(/\.mdx$/, "");
      const key = slug.toLowerCase();
      if (!(key in links)) links[key] = `/${section}/${slug}`;
    }
  }
  // Components documented on another component's page.
  for (const [name, page] of Object.entries(ALIASES)) {
    if (!(name in links) && links[page]) links[name] = links[page];
  }
  cached = links;
  return links;
}
