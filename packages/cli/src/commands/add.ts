import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative } from "node:path";
import { type ApiClient, CliError, failureFrom } from "../lib/api.js";
import { hasBlockIcons, iconsHint, registerBlockIcons } from "../lib/icons.js";
import { hashContent, type Lock, lockPath, readLock, writeLock } from "../lib/lock.js";
import { detectPackageManager, install, missingDependencies } from "../lib/package-manager.js";
import { resolveTarget } from "../lib/paths.js";

/** A block as the registry serves it (the shadcn registry-item shape). */
export type RegistryItem = {
  name: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: { path: string; target?: string; content: string }[];
};

const NAMESPACE = "@once-ui/";

/** `@once-ui/hero1`, `Hero1` and `hero1` all name the same block. */
export function blockId(name: string): string {
  return name.replace(NAMESPACE, "").trim().toLowerCase();
}

/** One block from the registry. */
export async function fetchBlock(client: ApiClient, id: string): Promise<RegistryItem> {
  const res = await client.fetch(`/api/registry/${encodeURIComponent(id)}`);
  if (res.status === 404) throw new CliError(`No block named "${id}".`);
  if (!res.ok) throw await failureFrom(res);
  return (await res.json()) as RegistryItem;
}

/**
 * Fetch the blocks asked for and every block they import, each once.
 * Blocks come back in the order they were first reached.
 */
export async function resolveBlocks(
  names: string[],
  fetchItem: (id: string) => Promise<RegistryItem>,
): Promise<RegistryItem[]> {
  const seen = new Map<string, RegistryItem>();
  const queue = names.map(blockId);
  while (queue.length) {
    const id = queue.shift() as string;
    if (seen.has(id)) continue;
    const item = await fetchItem(id);
    seen.set(id, item);
    for (const dep of item.registryDependencies ?? []) queue.push(blockId(dep));
  }
  return [...seen.values()];
}

/**
 * Every file the blocks ship, once, keyed by where it lands. Blocks can share
 * a file (a data module several of them import); the first one wins, and they
 * are identical anyway since they come from one registry build.
 */
export function plannedFiles(cwd: string, items: RegistryItem[]) {
  const files = new Map<string, { block: string; content: string }>();
  for (const item of items) {
    for (const file of item.files) {
      const path = resolveTarget(cwd, file.target ?? file.path);
      if (!files.has(path)) files.set(path, { block: item.name, content: file.content });
    }
  }
  return files;
}

/**
 * The package an import specifier installs as: `@once-ui-system/core/code` is
 * `@once-ui-system/core`, `next/image` is `next`. Null for app-local aliases
 * (`@/utils/x`) that older registry builds listed as dependencies.
 */
export function packageOf(spec: string): string | null {
  if (!/^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*(\/.*)?$/i.test(spec)) return null;
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

/** Install the npm packages the blocks need that package.json doesn't list yet. */
export async function installMissing(cwd: string, items: RegistryItem[], allowed: boolean) {
  const wanted = items
    .flatMap((item) => item.dependencies ?? [])
    .map(packageOf)
    .filter((name): name is string => name !== null);
  const deps = await missingDependencies(cwd, wanted);
  if (deps.length && allowed) {
    const pm = detectPackageManager(cwd);
    console.log(`\nInstalling ${deps.join(", ")} with ${pm}…`);
    await install(pm, deps, cwd);
  } else if (deps.length) {
    console.log(`\nNot installed (--no-install): ${deps.join(", ")}`);
  }
}

/** After writing blocks that bring the icons file, make sure the app registers it. */
export async function wireBlockIcons(cwd: string, paths: Iterable<string>) {
  const iconsFile = hasBlockIcons(paths);
  if (!iconsFile) return;
  const result = await registerBlockIcons(cwd, iconsFile);
  if (result.status === "patched") {
    console.log(`  edit   ${relative(cwd, result.file)} (registers the block icons)`);
  } else if (result.status === "manual") {
    console.log(`\n${iconsHint(cwd, iconsFile)}`);
  }
}

/**
 * Note each block's files in the lock with the hash of what the registry sent,
 * whether or not the file on disk was replaced: `update` then knows a file
 * that still matches it is untouched and safe to replace.
 */
export function recordInLock(cwd: string, lock: Lock, items: RegistryItem[]) {
  for (const item of items) {
    lock.blocks[item.name] = {
      files: Object.fromEntries(
        item.files.map((file) => [
          lockPath(cwd, resolveTarget(cwd, file.target ?? file.path)),
          hashContent(file.content),
        ]),
      ),
    };
  }
}

/** The blocks a command touched, by name, or a count when there are many. */
export const blockList = (items: RegistryItem[]) =>
  items.length > 6 ? `${items.length} blocks` : items.map((i) => i.name).join(", ");

export type AddFlags = { overwrite?: boolean; install?: boolean; cwd?: string };

export async function add(client: ApiClient, names: string[], flags: AddFlags) {
  if (!names.length) throw new CliError("Usage: once-ui add <block> [more blocks…]");
  const cwd = flags.cwd ?? process.cwd();

  const items = await resolveBlocks(names, (id) => fetchBlock(client, id));
  const lock = await readLock(cwd);

  recordInLock(cwd, lock, items);

  let written = 0;
  let skipped = 0;
  const planned = plannedFiles(cwd, items);
  for (const [path, file] of planned) {
    const shown = relative(cwd, path);
    if (existsSync(path) && !flags.overwrite) {
      if ((await readFile(path, "utf8")) === file.content) continue;
      console.log(`  skip   ${shown} (exists — pass --overwrite to replace)`);
      skipped++;
      continue;
    }
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, file.content);
    console.log(`  write  ${shown}`);
    written++;
  }
  await writeLock(cwd, lock);
  await wireBlockIcons(cwd, planned.keys());

  await installMissing(cwd, items, flags.install !== false);

  console.log(
    `\nAdded ${blockList(items)}: ${written} file(s) written${
      skipped ? `, ${skipped} skipped` : ""
    }.`,
  );
}
