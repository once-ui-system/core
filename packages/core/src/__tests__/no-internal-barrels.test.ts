import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Core's own files must import from the file that defines a symbol, never from
 * a directory barrel (`"."`, `"../components"`, `"../../contexts"`…).
 *
 * The barrels are the public API and stay exactly as they are: consumers keep
 * `import { Button } from "@once-ui-system/core"`. But when core itself goes
 * through a barrel, importing any one component drags in every module the
 * barrel re-exports. In a Next.js app that meant all 130 client components,
 * the 150 KB emoji dataset among them, shipped on every page no matter what
 * the page used, and no bundler setting (optimizePackageImports, sideEffects,
 * Turbopack's export pruning) could cut it back out. Direct imports inside
 * core are what let an app import one component and get one component.
 *
 * The barrel files themselves (`index.ts`) are the only exception.
 */

const SRC_ROOT = join(__dirname, "..");
const SKIPPED_DIRS = new Set(["__tests__", "test", "node_modules"]);
const EXTENSIONS = [".ts", ".tsx"];

const collect = (dir: string, files: string[] = []): string[] => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!SKIPPED_DIRS.has(entry)) collect(full, files);
    } else if (/\.tsx?$/.test(entry) && !entry.endsWith(".d.ts")) {
      files.push(full);
    }
  }
  return files;
};

const isBarrel = (from: string, specifier: string): boolean => {
  const base = resolve(dirname(from), specifier);
  // A same-named file wins over a directory, as it does for the resolver.
  if (EXTENSIONS.some((ext) => existsSync(base + ext))) return false;
  return EXTENSIONS.some((ext) => existsSync(join(base, `index${ext}`)));
};

describe("internal imports", () => {
  it("never go through a directory barrel", () => {
    const offenders: string[] = [];

    for (const file of collect(SRC_ROOT)) {
      if (/[\\/]index\.tsx?$/.test(file)) continue;
      const source = readFileSync(file, "utf8");
      for (const [, specifier] of source.matchAll(
        /(?:import|export)\s[^;]*?from\s*["'](\.{1,2}(?:\/[^"']*)?)["']/g,
      )) {
        if (isBarrel(file, specifier)) {
          offenders.push(`${relative(SRC_ROOT, file)} imports "${specifier}"`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
