import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guards the framework-coupling boundary described in
 * rfcs/2026-08-once-ui-2-architecture.md (§4).
 *
 * The 2.0 split moves every `next/*` import into @once-ui-system/nextjs and
 * every `recharts` import into @once-ui-system/data. Until then, this test
 * pins the coupling surface to the exact files below so it cannot silently
 * grow. If you add a file here, you are widening the framework boundary —
 * make sure that's a deliberate decision (and update the RFC inventory).
 */

const SRC_ROOT = join(__dirname, "..");

const NEXT_IMPORT_ALLOWLIST = [
  // Next-only surfaces that move wholesale to the nextjs package in Phase 4.
  "modules/seo/Meta.tsx",
  "modules/seo/Schema.tsx",
  // Adapter bindings behind the ./next subpath (never the root barrel) —
  // becomes @once-ui-system/nextjs in Phase 4. Runtime components consume
  // the AdapterProvider context instead of importing next/* directly.
  "next/index.tsx",
  "server/og-utils.ts",
];

const RECHARTS_ALLOWED_DIR = "modules/data";

const SKIPPED_DIRS = new Set(["__tests__", "test", "node_modules"]);

const collectSourceFiles = (dir: string, files: string[] = []): string[] => {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      if (!SKIPPED_DIRS.has(entry)) {
        collectSourceFiles(fullPath, files);
      }
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.(test|spec)\.(ts|tsx)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
};

// Matches static imports, re-exports, dynamic import() and require() of a package.
const importPattern = (pkg: string) =>
  new RegExp(
    `(?:from\\s*["']${pkg}(?:/[^"']*)?["']|import\\s*\\(\\s*["']${pkg}(?:/[^"']*)?["']|require\\s*\\(\\s*["']${pkg}(?:/[^"']*)?["'])`,
  );

const filesImporting = (pkg: string): string[] => {
  const pattern = importPattern(pkg);
  return collectSourceFiles(SRC_ROOT)
    .filter((file) => pattern.test(readFileSync(file, "utf8")))
    .map((file) => relative(SRC_ROOT, file).split(sep).join("/"))
    .sort();
};

describe("framework coupling boundary", () => {
  it("imports next/* only from the known adapter surface", () => {
    expect(filesImporting("next")).toEqual(NEXT_IMPORT_ALLOWLIST);
  });

  it("imports recharts only from modules/data", () => {
    const offenders = filesImporting("recharts").filter(
      (file) => !file.startsWith(`${RECHARTS_ALLOWED_DIR}/`),
    );
    expect(offenders).toEqual([]);
  });
});
