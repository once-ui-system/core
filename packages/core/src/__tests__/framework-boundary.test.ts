import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guards the framework-coupling boundary described in
 * rfcs/2026-08-once-ui-2-architecture.md (§4).
 *
 * The 2.0 split moves every `next/*` import into @once-ui-system/nextjs (the
 * charts left recharts for their own renderer in 3.0). Until then, this test
 * pins the coupling surface to the exact files below so it cannot silently
 * grow. If you add a file here, you are widening the framework boundary —
 * make sure that's a deliberate decision (and update the RFC inventory).
 */

const SRC_ROOT = join(__dirname, "..");

const NEXT_IMPORT_ALLOWLIST = [
  // The ONLY file in core allowed to import next/*. It sits behind the ./next
  // subpath (never the root barrel), so a non-Next bundler never resolves it,
  // and it becomes @once-ui-system/nextjs in Phase 4. Runtime components read
  // the AdapterProvider context instead of importing next/* directly. (The
  // subpath's index re-exports it next to the OG route factories, which need
  // no next/* import: they take a standard Request and return a Response.)
  //
  // This list is one entry on purpose. Meta.tsx, Schema.tsx and
  // server/og-utils.ts were removed from it when core became installable
  // without Next (`next` is an optional peer): Meta declares its own return
  // type, Schema emits a plain <script>, og-utils returns a standard Response.
  // Adding a file back here means Next is a hard requirement again.
  "next/adapters.tsx",
];

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

  it("loads maplibre-gl only from Map.impl, behind the lazy /map entry", () => {
    // Type imports are erased; anything else puts maplibre-gl in the graph of
    // every app that imports the file, map or no map.
    const runtime =
      /(?:import\s+(?!type\b)[^;]*?from\s*["']maplibre-gl["']|(?<!typeof\s)import\s*\(\s*["']maplibre-gl["']|require\s*\(\s*["']maplibre-gl["'])/;
    const offenders = collectSourceFiles(SRC_ROOT)
      .filter((file) => runtime.test(readFileSync(file, "utf8")))
      .map((file) => relative(SRC_ROOT, file).split(sep).join("/"));
    expect(offenders).toEqual(["modules/map/Map.impl.tsx"]);
  });

  it("imports recharts nowhere: the charts draw their own SVG since 3.0", () => {
    expect(filesImporting("recharts")).toEqual([]);
  });
});
