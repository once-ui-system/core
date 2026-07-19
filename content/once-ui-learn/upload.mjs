#!/usr/bin/env node
/**
 * Upload Once UI Learn content to Aveiro via API.
 * Usage: DOPLER_API_TOKEN=av_live_... node content/once-ui-learn/upload.mjs
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_BASE = "https://api.aveiro.app/api/v1";
const TOKEN = process.env.DOPLER_API_TOKEN;

if (!TOKEN) {
  console.error("DOPLER_API_TOKEN is required");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(join(__dirname, "manifest.json"), "utf8"));
const { siteId, pages, deletePageIds } = manifest;

async function api(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

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
  process.exit(1);
});
