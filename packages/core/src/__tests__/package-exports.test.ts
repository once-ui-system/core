import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import pkg from "../../package.json";

/**
 * Asserts every non-wildcard path in the package.json `exports` map points at
 * a file that the build actually emits (rfcs/2026-08-once-ui-2-architecture.md §5.1).
 *
 * This is the in-repo half of the package-contract checks (`pnpm check:package`
 * runs publint + arethetypeswrong against the packed tarball). It exists
 * because the `./icons`, `./types` and `./interfaces` subpaths shipped
 * pointing at `dist/<name>/index.js` while the build emits `dist/<name>.js`,
 * so all three were unresolvable for every consumer until fixed in 1.8.3.
 *
 * Requires `dist/` (turbo wires `test` to depend on `build`; locally run
 * `pnpm build` first if this suite errors on a missing dist).
 */

const PKG_ROOT = join(__dirname, "..", "..");
const DIST = join(PKG_ROOT, "dist");

const walk = (dir: string, files: string[] = []): string[] => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
};

type Manifest = {
  type?: string;
  main?: string;
  module?: string;
  bin: Record<string, string>;
  files: string[];
  exports: Record<string, unknown>;
  peerDependencies: Record<string, string>;
  peerDependenciesMeta: Record<string, unknown>;
};
const manifest = pkg as unknown as Manifest;

const collectExportPaths = (entry: unknown, paths: string[] = []): string[] => {
  if (typeof entry === "string") {
    paths.push(entry);
  } else if (entry && typeof entry === "object") {
    for (const value of Object.values(entry)) {
      collectExportPaths(value, paths);
    }
  }
  return paths;
};

describe("package exports integrity", () => {
  it("dist output exists (build must run before tests)", () => {
    expect(existsSync(join(PKG_ROOT, "dist", "index.js"))).toBe(true);
  });

  it("every non-wildcard exports path resolves to an emitted file", () => {
    const missing = Object.entries(manifest.exports).flatMap(([subpath, entry]) =>
      collectExportPaths(entry)
        .filter((target) => !target.includes("*"))
        .filter((target) => !existsSync(join(PKG_ROOT, target)))
        .map((target) => `${subpath} -> ${target}`),
    );
    expect(missing).toEqual([]);
  });
});

/**
 * The 3.0 contract (MIGRATING.md § 12, B2/B3/F9): real ESM, one entry per
 * subpath, no CommonJS promises, no deep imports.
 */
describe("the 3.0 exports map", () => {
  it("is real ESM with no main and no require condition", () => {
    expect(manifest.type).toBe("module");
    expect(manifest.main).toBeUndefined();
    expect(manifest.module).toBeUndefined();
    expect(JSON.stringify(manifest.exports)).not.toMatch(/"(require|import|node)"/);
  });

  it("lists exactly the public entry points", () => {
    expect(Object.keys(manifest.exports).filter((key) => !key.startsWith("./ai/"))).toEqual([
      ".",
      "./css/styles.css",
      "./css/tokens.css",
      "./tokens.json",
      "./config",
      "./server",
      "./next",
      "./AGENTS.md",
      "./data",
      "./code",
      "./emoji",
      "./media",
      "./map",
      "./mdx",
      "./package.json",
    ]);
  });

  it.each([
    "./components",
    "./components/*",
    "./contexts",
    "./hooks",
    "./icons",
    "./types",
    "./interfaces",
    "./utils",
    "./modules",
  ])("has no %s subpath (it duplicated the root, or exposed internals)", (subpath) => {
    expect(manifest.exports[subpath]).toBeUndefined();
  });

  it("gives every code entry its types and one default, both in dist", () => {
    for (const [subpath, entry] of Object.entries(manifest.exports)) {
      if (typeof entry === "string") continue;
      expect(Object.keys(entry as object), subpath).toEqual(["types", "default"]);
      const { types, default: target } = entry as { types: string; default: string };
      expect(types, subpath).toBe(target.replace(/\.js$/, ".d.ts"));
      expect(target, subpath).toMatch(/^\.\/dist\/.+\.js$/);
    }
  });

  it("puts the media components and EmojiPicker on their subpaths, not the root", () => {
    expect(manifest.exports["./media"]).toEqual({
      types: "./dist/modules/media/index.d.ts",
      default: "./dist/modules/media/index.js",
    });
    expect(manifest.exports["./emoji"]).toEqual({
      types: "./dist/modules/emoji/index.d.ts",
      default: "./dist/modules/emoji/index.js",
    });
    const media = readFileSync(join(PKG_ROOT, "src", "modules", "media", "index.ts"), "utf8");
    for (const name of ["MediaAudioPlayer", "MediaVideoPlayer", "Scrubber", "CompareImage"]) {
      expect(media).toMatch(new RegExp(`export \\{ ${name} \\}`));
    }
    const root = readFileSync(join(PKG_ROOT, "src", "components", "index.ts"), "utf8");
    expect(root).not.toMatch(/EmojiPicker|Scrubber|CompareImage|MediaAudioPlayer|MediaVideoPlayer/);
    // The data stays out of the root graph: only EmojiPicker imports it.
    const importers = walk(join(PKG_ROOT, "src"))
      .filter((file) => /\.tsx?$/.test(file) && !/__tests__/.test(file))
      .filter((file) => readFileSync(file, "utf8").includes("emoji-data.json"));
    expect(importers.map((file) => relative(PKG_ROOT, file))).toEqual([
      join("src", "components", "EmojiPicker.tsx"),
    ]);
  });

  it("runs its CommonJS bins as .cjs, and ships them", () => {
    for (const bin of Object.values(manifest.bin)) {
      expect(bin).toMatch(/\.cjs$/);
      expect(existsSync(join(PKG_ROOT, bin))).toBe(true);
      expect(manifest.files).toContain(bin.replace(/^\.\//, ""));
    }
  });

  it("has no sass peer", () => {
    expect(manifest.peerDependencies.sass).toBeUndefined();
    expect(manifest.peerDependenciesMeta.sass).toBeUndefined();
  });
});

describe("the built dist", () => {
  const files = walk(DIST).map((file) => relative(DIST, file));

  it("names every relative import with its extension, as Node's ESM resolver needs", () => {
    const bare: string[] = [];
    const json: string[] = [];
    for (const file of files.filter((name) => name.endsWith(".js"))) {
      const source = readFileSync(join(DIST, file), "utf8");
      for (const match of source.matchAll(
        /(?:\bfrom\s*|\bimport\s*\(\s*|^import\s+)["'](\.{1,2}\/[^"']*)["']([^;\n]*)/gm,
      )) {
        const [, specifier, rest] = match;
        if (!/\.(js|css|json)$/.test(specifier)) bare.push(`${file} -> ${specifier}`);
        if (specifier.endsWith(".json") && !/with\s*\{\s*type:\s*"json"\s*\}/.test(rest))
          json.push(`${file} -> ${specifier}`);
        if (!existsSync(join(DIST, file, "..", specifier)))
          bare.push(`${file} -> ${specifier} (missing)`);
      }
    }
    expect(bare).toEqual([]);
    expect(json).toEqual([]);
  });

  it("ships no Sass, source maps, tests or second copy of the harness", () => {
    expect(files.filter((name) => /\.(scss|sass|map)$/.test(name))).toEqual([]);
    expect(
      files.filter(
        (name) => /^(ai|agent|scripts|test|__tests__)[\\/]/.test(name) || /\.test\./.test(name),
      ),
    ).toEqual([]);
    expect(files.filter((name) => /^(README|AGENTS)\.md$/.test(name))).toEqual([]);
  });
});

describe("the ./mdx subpath", () => {
  it("resolves to the mdx module", () => {
    expect(manifest.exports["./mdx"]).toEqual({
      types: "./dist/modules/mdx/index.d.ts",
      default: "./dist/modules/mdx/index.js",
    });
  });

  it("ships the stylesheet its heading anchors import", () => {
    expect(existsSync(join(DIST, "modules", "mdx", "MdxElements.module.css"))).toBe(true);
  });

  it("is not re-exported from the root or modules barrels", () => {
    // The map renders code through CodeBlock; reaching it from the root would
    // put `prismjs` back in the graph of every app that never renders MDX.
    for (const barrel of ["index.ts", join("modules", "index.ts")]) {
      expect(readFileSync(join(PKG_ROOT, "src", barrel), "utf8")).not.toMatch(/mdx/);
    }
  });
});

describe("package bin entries", () => {
  // npm 11 drops a `bin` path that starts with "./" at publish, which shipped
  // 2.2.0 without `once-ui-init-agent` and `once-ui-validate-ai-code`.
  it("writes every bin path without a leading ./ and points at a shipped file", () => {
    const bins = Object.entries((pkg as { bin?: Record<string, string> }).bin ?? {});
    expect(bins.length).toBeGreaterThan(0);
    for (const [name, path] of bins) {
      expect(path, name).not.toMatch(/^\.\//);
      expect(existsSync(join(PKG_ROOT, path)), name).toBe(true);
      expect((pkg as { files: string[] }).files, name).toContain(path);
    }
  });
});
