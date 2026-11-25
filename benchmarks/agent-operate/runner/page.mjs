// Serves page/out on a free port and opens it in Chromium.
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "page", "out");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".svg": "image/svg+xml" };

export async function openPage() {
  const server = createServer((req, res) => {
    const file = path.join(out, req.url === "/" ? "index.html" : decodeURIComponent(req.url.split("?")[0]));
    try {
      res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
      res.end(readFileSync(file));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.waitForFunction(() => window.__agent && document.querySelector("[role=tablist]"));
  return {
    page,
    errors,
    close: async () => {
      await browser.close();
      server.close();
    },
  };
}
