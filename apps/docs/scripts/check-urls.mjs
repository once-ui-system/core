#!/usr/bin/env node
/**
 * Fails when a docs URL disappears without a redirect.
 *
 * Reorganising `src/content` is the one docs change that can quietly cost
 * traffic: the pages still build, the nav still works, and the only symptom is
 * a 404 for everyone arriving from Google or an old link. Adding pages is
 * always safe; removing or moving one is not.
 *
 *   node scripts/check-urls.mjs            # verify
 *   node scripts/check-urls.mjs --update   # accept the current set
 *
 * The snapshot is committed, so the diff shows exactly which URLs a branch
 * changes — which is the review question, not an implementation detail.
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(root, "src", "content");
const SNAPSHOT = join(root, "url-snapshot.json");

function slugs(dir = CONTENT) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...slugs(p));
    else if (entry.endsWith(".mdx")) out.push(relative(CONTENT, p).replace(/\.mdx$/, ""));
  }
  return out.sort();
}

const { movedPages } = await import(pathToFileURL(join(root, "src/resources/redirects.js")).href);

const current = slugs();

if (process.argv.includes("--update")) {
  writeFileSync(SNAPSHOT, `${JSON.stringify(current, null, 2)}\n`);
  console.log(`Recorded ${current.length} URLs in ${relative(root, SNAPSHOT)}.`);
  process.exit(0);
}

if (!existsSync(SNAPSHOT)) {
  console.error(`No snapshot at ${relative(root, SNAPSHOT)}. Run with --update to create one.`);
  process.exit(1);
}

const previous = JSON.parse(readFileSync(SNAPSHOT, "utf8"));
const live = new Set(current);
const redirected = new Map(movedPages.map(({ from, to }) => [from, to]));

const added = current.filter((s) => !previous.includes(s));
const gone = previous.filter((s) => !live.has(s));
const unredirected = gone.filter((s) => !redirected.has(s));
// A redirect that points at a page which does not exist is worse than none:
// it turns one 404 into a redirect chain ending in a 404.
const danglingTargets = [...redirected.entries()].filter(([, to]) => !live.has(to));

if (added.length) console.log(`New pages (${added.length}):\n  ${added.join("\n  ")}\n`);

let failed = false;

if (unredirected.length) {
  failed = true;
  console.error(`These URLs disappeared with no redirect (${unredirected.length}):\n`);
  for (const s of unredirected) console.error(`  /${s}`);
  console.error(`\nAdd each to movedPages in src/resources/redirects.js:\n`);
  for (const s of unredirected) console.error(`  { from: "${s}", to: "<new slug>" },`);
  console.error("");
}

if (danglingTargets.length) {
  failed = true;
  console.error(`These redirects point at pages that do not exist:\n`);
  for (const [from, to] of danglingTargets) console.error(`  /${from} → /${to}`);
  console.error("");
}

if (failed) {
  console.error("Once the redirects are in place, re-run with --update to accept the new set.");
  process.exit(1);
}

const moved = gone.filter((s) => redirected.has(s));
if (moved.length) {
  console.log(`Moved, with redirects (${moved.length}):`);
  for (const s of moved) console.log(`  /${s} → /${redirected.get(s)}`);
  console.log("");
}

console.log(`${current.length} URLs, none lost.`);
