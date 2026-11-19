/**
 * Writes public/llms.txt and public/llms-full.txt from the docs themselves,
 * so what an agent reads is what the site says, for the version this build
 * documents. Runs before dev and build (package.json predev/prebuild), after
 * sync-ai. Both files are gitignored; this script is how they come to be.
 *
 * llms.txt follows https://llmstxt.org: a title, a summary, then one link per
 * page with its summary, grouped as the sidebar groups them (meta.json).
 * llms-full.txt is the codegen rules followed by every page as Markdown: prose
 * and headings as written, each CodeBlock's code as a fenced block, each
 * PropsTable resolved from ai/spec.json, tables and callouts as text. Live
 * previews are dropped; they are what the code next to them renders.
 *
 * Usage: node scripts/build-llms.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import frontMatter from "front-matter";
import { currentVersion, SITE_URL } from "../src/resources/versions.data.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const contentDir = join(root, "src", "content");
const aiDir = join(root, "..", "..", "packages", "core", "ai");
const pkg = JSON.parse(
  readFileSync(join(root, "..", "..", "packages", "core", "package.json"), "utf8"),
);

/** Where this build is read: the stable site, its mount, or the version's own origin. */
export const site =
  currentVersion.status === "stable"
    ? SITE_URL
    : currentVersion.mounted
      ? `${SITE_URL}${currentVersion.path}`
      : currentVersion.origin;

const SUMMARY =
  "Once UI is an open-source design system and component library for Next.js and React Native: layout primitives, components, form controls, data display and effects, with tokens, themes and a machine-readable spec for coding agents.";

/** Every page, in sidebar order: `{ slug, title, summary, body, section }`. */
export function readPages(dir = contentDir, section = null) {
  const meta = readMeta(dir);
  const entries = readdirSync(dir).filter((name) => name !== "meta.json");
  const key = (name) => name.replace(/\.mdx$/, "");
  entries.sort((a, b) => {
    const oa = meta.pages?.[key(a)] ?? Number.POSITIVE_INFINITY;
    const ob = meta.pages?.[key(b)] ?? Number.POSITIVE_INFINITY;
    return oa - ob || a.localeCompare(b);
  });
  const pages = [];
  for (const name of entries) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      const title = readMeta(path).title ?? name;
      pages.push(...readPages(path, section ? `${section}: ${title}` : title));
    } else if (name.endsWith(".mdx")) {
      const { attributes, body } = frontMatter(readFileSync(path, "utf8"));
      pages.push({
        slug: relative(contentDir, path)
          .replace(/\.mdx$/, "")
          .replace(/\\/g, "/"),
        // Native pages share their titles with the web ones.
        title: `${attributes.title || basename(name, ".mdx")}${section?.startsWith("React Native") ? " (React Native)" : ""}`,
        summary: attributes.summary ?? "",
        body,
        section,
      });
    }
  }
  return pages;
}

function readMeta(dir) {
  const path = join(dir, "meta.json");
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
}

const url = (slug) => `${site}/${slug}`;

export function buildIndex(pages) {
  const lines = [
    "# Once UI",
    "",
    `> ${SUMMARY}`,
    "",
    `These docs are for ${pkg.name} ${pkg.version} (${currentVersion.label}). Install it with \`npm install ${pkg.name}${currentVersion.npmTag && currentVersion.npmTag !== "latest" ? `@${currentVersion.npmTag}` : ""}\`. Every page below is also served as Markdown: request it with \`Accept: text/markdown\`. [llms-full.txt](${site}/llms-full.txt) has all of them in one file.`,
    "",
    "## Writing Once UI code",
    "",
    `- [Codegen rules](${site}/ai/rules.md): The rules generated code must follow`,
    `- [Compact rules](${site}/ai/rules.compact.md): The same rules, short enough for a system prompt`,
    `- [Component spec](${site}/ai/spec.json): Every component's props, tokens and types, generated from the source`,
    `- [Component catalog](${site}/ai/catalog.json): What each component is for, and what it pairs with`,
    `- [Task bundles](${site}/ai/tasks/index.json): Common tasks mapped to components and worked examples`,
    `- [AI harness manifest](${site}/ai/manifest.json): Index of all of the above`,
  ];
  let section;
  for (const page of pages) {
    if (page.section !== section) {
      section = page.section;
      lines.push("", `## ${section ?? "Start here"}`, "");
    }
    lines.push(`- [${page.title}](${url(page.slug)})${page.summary ? `: ${page.summary}` : ""}`);
  }
  lines.push(
    "",
    "## Optional",
    "",
    "- [Once UI Pro](https://once-ui.com/products): Templates and copy-paste blocks built on Once UI",
    "- [Once UI for Figma](https://once-ui.com/figma): The design system as a Figma library",
    "- [Source](https://github.com/once-ui-system/core): The core repository",
  );
  return `${lines.join("\n")}\n`;
}

export function buildFull(pages, spec, rules) {
  const parts = [
    `# Once UI\n\n> ${SUMMARY}\n\nThe complete docs for ${pkg.name} ${pkg.version} (${currentVersion.label}), one page after another, after the rules generated code must follow. The index is at ${site}/llms.txt.`,
    rules.trim(),
  ];
  for (const page of pages) {
    const head = [`# ${page.title}`, "", `Source: ${url(page.slug)}`];
    if (page.summary) head.push("", `> ${page.summary}`);
    parts.push(`${head.join("\n")}\n\n${mdxToMarkdown(page.body, spec)}`.trim());
  }
  return `${parts.join("\n\n---\n\n")}\n`;
}

/**
 * MDX to Markdown. Lines outside JSX pass through, with inline code and
 * links turned back into Markdown. A top-level JSX element (one starting at
 * column 0) is read whole, minding template literals, whose lines can start
 * with `<` or `/>` too, and replaced by what it says in text, if anything.
 */
export function mdxToMarkdown(body, spec) {
  const lines = body.split("\n");
  const out = [];
  let fence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (fence || /^\s*(```|~~~)/.test(line)) {
      out.push(line);
      continue;
    }
    if (/^(import|export)\s/.test(line)) continue;
    const open = /^<([A-Z][\w.]*)/.exec(line);
    if (!open) {
      out.push(inline(line));
      continue;
    }
    const end = blockEnd(lines, i, open[1]);
    out.push(element(open[1], lines.slice(i, end + 1).join("\n"), spec));
    i = end;
  }
  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function blockEnd(lines, start, tag) {
  let template = false;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (!template) {
      if (i === start && selfContained(line, tag)) return i;
      if (i > start && (/^\/>\s*$/.test(line) || line.trim() === `</${tag}>`)) return i;
    }
    for (let j = 0; j < line.length; j++) {
      if (line[j] === "\\") j++;
      else if (line[j] === "`") template = !template;
    }
  }
  return lines.length - 1;
}

/** `<Tag … />` or `<Tag …>…</Tag>` on one line. */
function selfContained(line, tag) {
  return /\/>\s*$/.test(line) || line.trimEnd().endsWith(`</${tag}>`);
}

function element(tag, source, spec) {
  switch (tag) {
    case "CodeBlock":
      return codeBlock(source);
    case "PropsTable":
      return propsTable(source, spec);
    case "Table":
      return table(source);
    case "Feedback": {
      const title = stringProp(source, "title");
      const description = textProp(source, "description");
      const text = [title && `**${title}**`, description].filter(Boolean).join(" ");
      return text ? `> ${text}` : "";
    }
    default:
      return "";
  }
}

/** Each `code` in `codes`, with its label and language. */
function codeBlock(source) {
  const blocks = [];
  const re = /code:\s*`((?:\\[\s\S]|[^`\\])*)`([\s\S]*?)(?=code:\s*`|$)/g;
  for (const [, code, rest] of source.matchAll(re)) {
    const language = /language:\s*"([^"]*)"/.exec(rest)?.[1] ?? "tsx";
    const label = /label:\s*"([^"]*)"/.exec(rest)?.[1];
    const text = code.replace(/\\(`|\$\{|\\)/g, "$1").replace(/\n+$/, "");
    blocks.push(`${label ? `${label}:\n\n` : ""}\`\`\`${language}\n${text}\n\`\`\``);
  }
  return blocks.join("\n\n");
}

/** The props table the page renders, from the same spec. */
function propsTable(source, spec) {
  const component = stringProp(source, "component");
  const mixin = stringProp(source, "mixin");
  const describe = {};
  const described = /describe=\{\{([\s\S]*?)\}\}\s*(?:\w+=|\/>)/.exec(source)?.[1] ?? "";
  for (const [, name, text] of described.matchAll(/(\w+):\s*"((?:\\.|[^"\\])*)"/g)) {
    describe[name] = inline(readString(text));
  }
  const only = listProp(source, "only");
  const exclude = listProp(source, "exclude") ?? [];

  const rows = [];
  const entry = component ? spec.components?.[component] : null;
  const props = entry ? entry.props : mixin ? spec.mixins?.[mixin] : null;
  if (props) {
    const names = (only ?? Object.keys(props)).filter((n) => n in props && !exclude.includes(n));
    for (const name of names) {
      const raw = String(props[name]);
      const required = raw.startsWith("!");
      const [type, fallback] = raw.replace(/^!/, "").split(/ = (?=[^=]*$)/);
      rows.push([
        `${name}${required ? " (required)" : ""}`,
        type,
        fallback ?? "",
        describe[name] ?? "",
      ]);
    }
  }
  const extra = /content=\{\[([\s\S]*?)\]\}\s*(?:\w+=|\/>)/.exec(source)?.[1] ?? "";
  for (const [, row] of extra.matchAll(/\[\s*("[\s\S]*?)\]/g)) {
    const cells = [...row.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((m) => inline(readString(m[1])));
    if (cells[0]?.startsWith("...")) rows.push([cells[0], "", "", "Also takes these props"]);
    else if (cells.length) rows.push([cells[0], cells[1] ?? "", cells[2] ?? "", cells[3] ?? ""]);
  }
  if (entry?.mixins?.length)
    rows.push([`...${entry.mixins.join(", ...")}`, "", "", "Also takes these props"]);
  if (!rows.length) return "";
  const cell = (s) => (s ? String(s).replace(/\|/g, "\\|").replace(/\n/g, " ") : "");
  const code = (s) => (s ? `\`${cell(s)}\`` : "");
  return [
    "| Prop | Type | Default | Description |",
    "| --- | --- | --- | --- |",
    ...rows.map(([n, t, d, x]) => `| ${code(n)} | ${code(t)} | ${code(d)} | ${cell(x)} |`),
  ].join("\n");
}

/** `columns` headers and `rows` of strings or `<InlineCode>`. */
function table(source) {
  const headers = [
    ...(/columns=\{\[([\s\S]*?)\]\}/.exec(source)?.[1] ?? "").matchAll(/header:\s*"([^"]*)"/g),
  ].map((m) => m[1]);
  const body = /rows=\{\[([\s\S]*)\]\}/.exec(source)?.[1] ?? "";
  const rows = [];
  for (const line of body.split("\n")) {
    const row = /^\s*\[(.*)\],?\s*$/.exec(line)?.[1];
    if (row) rows.push(splitTop(row).map((cell) => inline(unquote(cell.trim()))));
  }
  if (!headers.length || !rows.length) return "";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((r) => `| ${r.map((c) => c.replace(/\|/g, "\\|")).join(" | ")} |`),
  ].join("\n");
}

function splitTop(text) {
  const cells = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if ("<{([".includes(ch)) depth++;
    else if (">})]".includes(ch)) depth--;
    else if (ch === "," && depth === 0) {
      cells.push(text.slice(start, i));
      start = i + 1;
    }
  }
  cells.push(text.slice(start));
  return cells;
}

/** A JS string literal's body, with its escapes (`\u2014`, `\"`) read. */
function readString(body) {
  try {
    return JSON.parse(`"${body.replace(/\\'/g, "'")}"`);
  } catch {
    return body;
  }
}

const unquote = (s) => /^"(.*)"$/.exec(s)?.[1] ?? s;

function stringProp(source, name) {
  return new RegExp(`\\b${name}="([^"]*)"`).exec(source)?.[1] ?? null;
}

function listProp(source, name) {
  const list = new RegExp(`\\b${name}=\\{\\[([^\\]]*)\\]\\}`).exec(source)?.[1];
  return list ? [...list.matchAll(/"([^"]*)"/g)].map((m) => m[1]) : null;
}

/** A prop given as a string or as a fragment of text, as plain Markdown. */
function textProp(source, name) {
  const plain = stringProp(source, name);
  if (plain) return plain;
  const fragment = new RegExp(`\\b${name}=\\{<>([\\s\\S]*?)</>\\}`).exec(source)?.[1];
  return fragment
    ? inline(fragment)
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim()
    : null;
}

function inline(text) {
  return text
    .replace(/\]\(\/(?!\/)/g, `](${site}/`)
    .replace(
      /<InlineCode>([\s\S]*?)<\/InlineCode>/g,
      (_, code) => `\`${code.replace(/\{"([^"]*)"\}/g, "$1")}\``,
    )
    .replace(
      /<SmartLink[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/SmartLink>/g,
      (_, href, label) => `[${label}](${href.startsWith("/") ? site + href : href})`,
    )
    .replace(/<Kbd>([\s\S]*?)<\/Kbd>/g, "`$1`");
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  const pages = readPages();
  const spec = JSON.parse(readFileSync(join(aiDir, "spec.json"), "utf8"));
  const rules = readFileSync(join(aiDir, "rules.md"), "utf8");
  const index = buildIndex(pages);
  const full = buildFull(pages, spec, rules);
  writeFileSync(join(root, "public", "llms.txt"), index);
  writeFileSync(join(root, "public", "llms-full.txt"), full);
  const kb = (s) => `${Math.round(Buffer.byteLength(s) / 1024)} KB`;
  console.log(
    `build-llms: ${pages.length} pages -> public/llms.txt (${kb(index)}), public/llms-full.txt (${kb(full)})`,
  );
}
