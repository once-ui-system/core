#!/usr/bin/env node
/**
 * Upload Once UI Learn MDX pages to Aveiro.
 * Requires DOPLER_API_TOKEN env var.
 *
 * Usage:
 *   node content/once-ui-learn/upload.mjs          # create or update all manifest pages
 *   node content/once-ui-learn/upload.mjs --dry-run
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = "https://api.aveiro.app/api/v1";
const TOKEN = process.env.DOPLER_API_TOKEN;

if (!TOKEN) {
  console.error("Missing DOPLER_API_TOKEN");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const manifest = JSON.parse(readFileSync(join(__dirname, "manifest.json"), "utf8"));
const { siteId, pages } = manifest;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${options.method || "GET"} ${path} → ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function listPages() {
  const data = await api(`/sites/${siteId}/pages`);
  return data.pages ?? [];
}

async function createPage(entry, content) {
  const today = new Date().toISOString().slice(0, 10);
  return api(`/sites/${siteId}/pages`, {
    method: "POST",
    body: JSON.stringify({
      path: entry.path,
      title: entry.title,
      content,
      metadata: {
        title: entry.title,
        summary: entry.summary,
        tag: entry.tag,
        image: "",
        publishedAt: today,
      },
    }),
  });
}

async function updatePage(pageId, entry, content, revision) {
  const today = new Date().toISOString().slice(0, 10);
  return api(`/sites/${siteId}/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({
      title: entry.title,
      content,
      metadata: {
        title: entry.title,
        summary: entry.summary,
        tag: entry.tag,
        image: "",
        publishedAt: today,
      },
      revision,
    }),
  });
}

async function main() {
  const existing = await listPages();
  const byPath = new Map(existing.map((p) => [p.path, p]));

  for (const entry of pages) {
    const content = readFileSync(join(__dirname, entry.file), "utf8");
    const found = byPath.get(entry.path);

    if (dryRun) {
      console.log(`${found ? "UPDATE" : "CREATE"} ${entry.path} (${content.length} chars)`);
      continue;
    }

    if (found) {
      const full = await api(`/sites/${siteId}/pages/${found.id}`);
      const result = await updatePage(found.id, entry, content, full.page.revision);
      console.log(`Updated ${entry.path} → ${result.page.id}`);
    } else {
      const result = await createPage(entry, content);
      console.log(`Created ${entry.path} → ${result.page.id}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
