import { existsSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";

/** The support file that carries the icons blocks use beyond Once UI's built-ins. */
export const BLOCK_ICONS_FILE = "blockIcons.ts";

const SKIP = new Set(["node_modules", ".next", ".git", "dist", "out", "build"]);

/** Every .tsx file in the project, outside build output and dependencies. */
async function sourceFiles(dir: string, out: string[] = []): Promise<string[]> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name) || entry.name.startsWith(".")) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await sourceFiles(full, out);
    else if (entry.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

export type IconRegistration =
  | { status: "already" | "patched"; file: string }
  | { status: "manual" };

/**
 * Make sure the app's `IconProvider` registers the block icons, so they don't
 * render empty. When it is wired the way Once UI apps and Stack scaffolds wire
 * it (`<IconProvider icons={iconLibrary}>`) the CLI adds them in place;
 * anything else is left alone and the caller prints how to do it by hand.
 */
export async function registerBlockIcons(
  cwd: string,
  iconsFile: string,
): Promise<IconRegistration> {
  for (const file of await sourceFiles(cwd)) {
    if (file === iconsFile) continue;
    const src = await readFile(file, "utf8");
    if (!src.includes("<IconProvider")) continue;
    if (src.includes("blockIcons")) return { status: "already", file };

    const matches = src.match(/icons=\{iconLibrary\}/g);
    if (matches?.length !== 1) return { status: "manual" };

    let spec = relative(dirname(file), iconsFile).split(sep).join("/").replace(/\.ts$/, "");
    if (!spec.startsWith(".")) spec = `./${spec}`;
    const imports = [...src.matchAll(/^import[\s\S]*?from\s+["'][^"']+["'];?$/gm)];
    const last = imports.at(-1);
    const at = last ? (last.index ?? 0) + last[0].length : 0;
    const patched =
      `${src.slice(0, at)}\nimport { blockIcons } from "${spec}";${src.slice(at)}`.replace(
        "icons={iconLibrary}",
        "icons={{ ...iconLibrary, ...blockIcons }}",
      );
    await writeFile(file, patched);
    return { status: "patched", file };
  }
  return { status: "manual" };
}

export const iconsHint = (cwd: string, iconsFile: string) =>
  `Some of these blocks use icons beyond Once UI's built-in set. Register them where your IconProvider is:

  import { blockIcons } from "@/${relative(cwd, iconsFile)
    .split(sep)
    .join("/")
    .replace(/^src\//, "")
    .replace(/\.ts$/, "")}";
  <IconProvider icons={{ ...iconLibrary, ...blockIcons }}>`;

export const hasBlockIcons = (paths: Iterable<string>) => {
  for (const path of paths)
    if (path.endsWith(`${sep}${BLOCK_ICONS_FILE}`) && existsSync(path)) return path;
  return null;
};
