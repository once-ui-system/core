#!/usr/bin/env node
/**
<<<<<<< HEAD
<<<<<<< HEAD
 * Upload Once UI Learn content to Aveiro via API.
 * Usage: DOPLER_API_TOKEN=av_live_... node content/once-ui-learn/upload.mjs
 */

import { readFileSync } from "node:fs";
=======
=======
>>>>>>> origin/cursor/learn-site-new-pages-9fc0
 * Upload Once UI Learn pages to Aveiro.
 *
 * Usage:
 *   DOPLER_API_TOKEN=<token> node content/once-ui-learn/upload.mjs
 *   DOPLER_API_TOKEN=<token> node content/once-ui-learn/upload.mjs --publish
 */

import { readFileSync, existsSync } from "node:fs";
<<<<<<< HEAD
>>>>>>> origin/cursor/learn-site-new-pages-3aed
=======
>>>>>>> origin/cursor/learn-site-new-pages-9fc0
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
<<<<<<< HEAD
<<<<<<< HEAD
const API_BASE = "https://api.aveiro.app/api/v1";
=======
const BASE_URL = "https://api.aveiro.app/api/v1";
>>>>>>> origin/cursor/learn-site-new-pages-3aed
=======
const BASE_URL = "https://api.aveiro.app/api/v1";
>>>>>>> origin/cursor/learn-site-new-pages-9fc0
const TOKEN = process.env.DOPLER_API_TOKEN;

if (!TOKEN) {
  console.error("DOPLER_API_TOKEN is required");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(join(__dirname, "manifest.json"), "utf8"));
<<<<<<< HEAD
<<<<<<< HEAD
const { siteId, pages, deletePageIds } = manifest;

async function api(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
=======
=======
>>>>>>> origin/cursor/learn-site-new-pages-9fc0
const shouldPublish = process.argv.includes("--publish");

async function api(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
<<<<<<< HEAD
>>>>>>> origin/cursor/learn-site-new-pages-3aed
=======
>>>>>>> origin/cursor/learn-site-new-pages-9fc0
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
<<<<<<< HEAD
<<<<<<< HEAD
  const data = await res.json();
=======
=======
>>>>>>> origin/cursor/learn-site-new-pages-9fc0
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
<<<<<<< HEAD
>>>>>>> origin/cursor/learn-site-new-pages-3aed
=======
>>>>>>> origin/cursor/learn-site-new-pages-9fc0
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

<<<<<<< HEAD
<<<<<<< HEAD
async function main() {
  console.log(`Site: ${siteId}`);
  console.log(`Pages to upload: ${pages.length}`);

  for (const id of deletePageIds) {
    console.log(`Deleting old page ${id}...`);
    await api("DELETE", `/sites/${siteId}/pages/${id}`);
  }

  for (const page of pages) {
    const content = readFileSync(join(__dirname, page.file), "utf8");
    const payload = {
      path: page.path,
      title: page.title,
      content,
      metadata: {
        title: page.title,
        summary: page.summary,
      },
    };

    if (page.contentId) {
      console.log(`Updating ${page.path}...`);
      const { path: _path, ...updatePayload } = payload;
      await api("PATCH", `/sites/${siteId}/pages/${page.contentId}`, updatePayload);
    } else {
      console.log(`Creating ${page.path}...`);
      const result = await api("POST", `/sites/${siteId}/pages`, payload);
      console.log(`  → ${result.page.id}`);
    }
  }

  console.log("Done. Review drafts in the Aveiro editor and publish when ready.");
}

main().catch((err) => {
  console.error(err.message);
=======
=======
>>>>>>> origin/cursor/learn-site-new-pages-9fc0
async function listPages(siteId) {
  const { pages } = await api("GET", `/sites/${siteId}/pages`);
  return pages;
}

async function upsertPage(siteId, entry, existingByPath) {
  const filePath = join(__dirname, entry.file);
  if (!existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  const content = readFileSync(filePath, "utf8");
  const metadata = {
    title: entry.title,
    summary: entry.summary,
  };
  const existing = existingByPath.get(entry.path);
  if (existing) {
    const { page } = await api("PATCH", `/sites/${siteId}/pages/${existing.id}`, {
      content,
      metadata,
      title: entry.title,
    });
    console.log(`Updated: ${entry.path} (${page.id})`);
    return page;
  }
  const { page } = await api("POST", `/sites/${siteId}/pages`, {
    path: entry.path,
    title: entry.title,
    content,
    metadata,
  });
  console.log(`Created: ${entry.path} (${page.id})`);
  return page;
}

async function main() {
  const { siteId, pages } = manifest;
  const existing = await listPages(siteId);
  const existingByPath = new Map(existing.map((p) => [p.path, p]));

  const results = [];
  for (const entry of pages) {
    const page = await upsertPage(siteId, entry, existingByPath);
    results.push({ path: entry.path, id: page.id });
  }

  if (shouldPublish) {
    const pub = await api("POST", `/sites/${siteId}/publish`);
    console.log(`Published: ${pub.published} page(s)`);
  }

  console.log(JSON.stringify({ uploaded: results.length, pages: results }, null, 2));
}

main().catch((err) => {
  console.error(err);
<<<<<<< HEAD
>>>>>>> origin/cursor/learn-site-new-pages-3aed
=======
>>>>>>> origin/cursor/learn-site-new-pages-9fc0
  process.exit(1);
});
