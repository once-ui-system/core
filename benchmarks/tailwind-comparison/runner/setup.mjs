#!/usr/bin/env node
// Builds everything a run needs, from pinned sources:
//   1. installs each arm scaffold (npm ci against the committed lockfiles)
//   2. builds each arm's read-only sandbox: work/sandbox/<arm>/{project,docs}
//   3. writes work/context-manifest.json (sha256, bytes, proxy tokens per file)
//
// Usage:
//   node runner/setup.mjs --shadcn-src <path to a shadcn-ui/ui clone at the pinned commit>
//                         [--once-version 2.1.0-rc.0 | --once-tarball <path>] [--skip-install]
//
// --once-version packs the published package from npm (the full run); --once-tarball
// uses a local `pnpm pack` (the pilot). Either way the tarball's sha256 is recorded.
//
// The Once UI tarball is `pnpm pack` of packages/core at the commit pinned in
// config.json (see README.md for the exact commands). Its sha256 is checked.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ROOT, WORK, config, listFiles, proxyTokens, sha256File } from "./lib.mjs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1]?.startsWith("--") ? true : (all[i + 1] ?? true)]);
    return acc;
  }, []),
);

let onceTarball = path.resolve(args["once-tarball"] ?? path.join(ROOT, "arms/once/vendor/once-ui-system-core.tgz"));
const onceVersion = typeof args["once-version"] === "string" ? args["once-version"] : null;
if (onceVersion) {
  const packDir = path.join(WORK, "pack");
  fs.rmSync(packDir, { recursive: true, force: true });
  fs.mkdirSync(packDir, { recursive: true });
  const file = execFileSync("npm", ["pack", `@once-ui-system/core@${onceVersion}`, "--pack-destination", packDir, "--silent"])
    .toString()
    .trim()
    .split("\n")
    .at(-1);
  onceTarball = path.join(packDir, file);
  console.log(`packed @once-ui-system/core@${onceVersion} -> ${path.relative(ROOT, onceTarball)}`);
}
const shadcnSrc = args["shadcn-src"] && path.resolve(args["shadcn-src"]);
if (!shadcnSrc) {
  console.error("--shadcn-src is required (git clone https://github.com/shadcn-ui/ui and check out the pinned commit)");
  process.exit(1);
}

// --- 0. verify pinned sources ------------------------------------------------
const tarSha = sha256File(onceTarball);
if (onceVersion) {
  console.log(`Once UI ${onceVersion} tarball sha256 ${tarSha}`);
} else if (tarSha !== config.sources.once_ui.tarball_sha256) {
  console.warn(`WARNING: Once UI tarball sha256 ${tarSha} != pinned ${config.sources.once_ui.tarball_sha256}`);
}
const shadcnHead = execFileSync("git", ["-C", shadcnSrc, "rev-parse", "HEAD"]).toString().trim();
if (shadcnHead !== config.sources.shadcn.commit) {
  console.warn(`WARNING: shadcn checkout ${shadcnHead} != pinned ${config.sources.shadcn.commit}`);
}
const vendored = path.join(ROOT, "arms/once/vendor/once-ui-system-core.tgz");
if (onceTarball !== vendored) {
  fs.mkdirSync(path.dirname(vendored), { recursive: true });
  fs.copyFileSync(onceTarball, vendored);
}

// --- 1. install scaffolds ----------------------------------------------------
if (!args["skip-install"] && onceVersion) {
  // `npm install` doesn't re-resolve a file: dependency whose locked integrity no
  // longer matches the tarball: it fails with EINTEGRITY. Drop the stale entry so
  // npm records the new tarball's version and integrity.
  const lockPath = path.join(ROOT, "arms/once/package-lock.json");
  const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  if (lock.packages?.["node_modules/@once-ui-system/core"]) {
    delete lock.packages["node_modules/@once-ui-system/core"];
    fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  }
}
if (!args["skip-install"]) {
  for (const scaffold of ["once", "shadcn", "tailwind"]) {
    // A different Once UI tarball changes the lockfile's integrity entry for the
    // file: dependency, so that scaffold is re-resolved with `npm install` (commit
    // the updated arms/once/package-lock.json with the results).
    const cmd = scaffold === "once" && onceVersion ? "install" : "ci";
    console.log(`npm ${cmd}: arms/${scaffold}`);
    execFileSync("npm", [cmd, "--no-audit", "--no-fund", "--loglevel=error"], {
      cwd: path.join(ROOT, "arms", scaffold),
      stdio: "inherit",
    });
  }
  // Gate working copies hard-link node_modules at creation; rebuild them.
  fs.rmSync(path.join(WORK, "gate"), { recursive: true, force: true });
}

// --- 2. sandboxes -------------------------------------------------------------
const SANDBOX = path.join(WORK, "sandbox");
fs.rmSync(SANDBOX, { recursive: true, force: true });

const PROJECT_EXCLUDE = /(^|\/)(node_modules|\.next|vendor)(\/|$)|next-env\.d\.ts$|package-lock\.json$|tsconfig\.tsbuildinfo$/;

function copyTree(from, to, { exclude, transform } = {}) {
  for (const rel of listFiles(from)) {
    if (exclude?.test(rel)) continue;
    const dest = path.join(to, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    const buf = fs.readFileSync(path.join(from, rel));
    fs.writeFileSync(dest, transform && /\.(tsx?|mdx?)$/.test(rel) ? transform(buf.toString()) : buf);
  }
}

// Same rewrite the shadcn CLI performs when it copies registry source into an app.
const shadcnImports = (s) =>
  s
    .replaceAll('from "cn"', 'from "@/lib/utils"')
    .replace(/@\/registry\/new-york-v4\/blocks\/[^/"]+\/components\//g, "@/components/")
    .replaceAll("@/registry/new-york-v4/ui/", "@/components/ui/")
    .replaceAll("@/registry/new-york-v4/hooks/", "@/hooks/")
    .replaceAll("@/registry/new-york-v4/lib/", "@/lib/");

for (const [letter, arm] of Object.entries(config.arms)) {
  const base = path.join(SANDBOX, arm.id);
  copyTree(path.join(ROOT, "arms", arm.scaffold), path.join(base, "project"), { exclude: PROJECT_EXCLUDE });

  if (arm.docs === "once-harness") {
    // The harness exactly as shipped in the package: AGENTS.md + ai/**,
    // minus the eval task list (it names the expected components per task).
    const tmp = fs.mkdtempSync(path.join(WORK, "tar-"));
    execFileSync("tar", ["-xzf", onceTarball, "-C", tmp]);
    const pkg = path.join(tmp, "package");
    const docs = path.join(base, "docs");
    fs.mkdirSync(docs, { recursive: true });
    fs.copyFileSync(path.join(pkg, "AGENTS.md"), path.join(docs, "AGENTS.md"));
    const excluded = new Set(config.sources.once_ui.excluded_from_context);
    copyTree(path.join(pkg, "ai"), path.join(docs, "ai"), {
      exclude: { test: (rel) => excluded.has(`ai/${rel}`) },
    });
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  if (arm.docs === "shadcn") {
    const v4 = path.join(shadcnSrc, "apps/v4");
    const docs = path.join(base, "docs");
    // Official agent skill (minus its own evals, images and other-agent configs).
    copyTree(path.join(shadcnSrc, "skills/shadcn"), path.join(docs, "skill"), {
      exclude: /^(evals|assets\/[^/]+\.png|agents|scripts)(\/|$)/,
    });
    // The skill injects `npx shadcn info --json` at load time. The CLI is not
    // available to the model, so substitute the equivalent static project info.
    const skillPath = path.join(docs, "skill/SKILL.md");
    const info = {
      framework: "next-app",
      config: JSON.parse(fs.readFileSync(path.join(ROOT, "arms/shadcn/components.json"), "utf8")),
      base: "radix",
      installed: fs
        .readdirSync(path.join(ROOT, "arms/shadcn/components/ui"))
        .map((f) => f.replace(/\.tsx$/, ""))
        .sort(),
    };
    fs.writeFileSync(
      skillPath,
      fs.readFileSync(skillPath, "utf8").replace("!`npx shadcn@latest info --json`", JSON.stringify(info, null, 2)),
    );
    fs.copyFileSync(path.join(v4, "public/llms.txt"), path.join(docs, "llms.txt"));
    copyTree(path.join(v4, "content/docs/components/radix"), path.join(docs, "components"), { exclude: /^meta\.json$/ });
    fs.mkdirSync(path.join(docs, "installation"), { recursive: true });
    fs.copyFileSync(path.join(v4, "content/docs/installation/next.mdx"), path.join(docs, "installation/next.mdx"));
    copyTree(path.join(v4, "registry/new-york-v4/examples"), path.join(docs, "examples"), { transform: shadcnImports });
    copyTree(path.join(v4, "registry/new-york-v4/blocks"), path.join(docs, "blocks"), { transform: shadcnImports });
    fs.copyFileSync(path.join(ROOT, "prompts/shadcn-docs-README.md"), path.join(docs, "README.md"));
  }
}

// --- 3. manifest ----------------------------------------------------------------
const manifest = {
  generated: new Date().toISOString(),
  tokenizer: "proxy (see lib.mjs)",
  once_ui: { version: onceVersion ?? "local tarball", tarball_sha256: tarSha },
  shadcn_commit: shadcnHead,
  arms: {},
};
for (const arm of Object.values(config.arms)) {
  const base = path.join(SANDBOX, arm.id);
  const files = listFiles(base).map((rel) => {
    const text = fs.readFileSync(path.join(base, rel), "utf8");
    return {
      path: rel,
      bytes: Buffer.byteLength(text),
      sha256: createHash("sha256").update(text).digest("hex"),
      ...proxyTokens(text),
    };
  });
  const sum = (k, pred = () => true) => files.filter(pred).reduce((s, f) => s + f[k], 0);
  manifest.arms[arm.id] = {
    files: files.length,
    docs_bytes: sum("bytes", (f) => f.path.startsWith("docs/")),
    docs_tokens_o200k: sum("o200k", (f) => f.path.startsWith("docs/")),
    project_bytes: sum("bytes", (f) => f.path.startsWith("project/")),
    project_tokens_o200k: sum("o200k", (f) => f.path.startsWith("project/")),
    list: files,
  };
}
fs.writeFileSync(path.join(WORK, "context-manifest.json"), JSON.stringify(manifest, null, 2));
for (const [id, m] of Object.entries(manifest.arms)) {
  console.log(
    `${id.padEnd(16)} files=${m.files} docs=${m.docs_bytes}B/${m.docs_tokens_o200k}tok project=${m.project_bytes}B/${m.project_tokens_o200k}tok`,
  );
}
