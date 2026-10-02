import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative } from "node:path";
import { type ApiClient, CliError, failureFrom } from "../lib/api.js";
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

export type AddFlags = { overwrite?: boolean; install?: boolean; cwd?: string };

export async function add(client: ApiClient, names: string[], flags: AddFlags) {
  if (!names.length) throw new CliError("Usage: once-ui add <block> [more blocks…]");
  const cwd = flags.cwd ?? process.cwd();

  const items = await resolveBlocks(names, async (id) => {
    const res = await client.fetch(`/api/registry/${encodeURIComponent(id)}`);
    if (res.status === 404) throw new CliError(`No block named "${id}".`);
    if (!res.ok) throw await failureFrom(res);
    return (await res.json()) as RegistryItem;
  });

  let written = 0;
  let skipped = 0;
  for (const item of items) {
    for (const file of item.files) {
      const path = resolveTarget(cwd, file.target ?? file.path);
      const shown = relative(cwd, path);
      if (existsSync(path) && !flags.overwrite) {
        console.log(`  skip   ${shown} (exists — pass --overwrite to replace)`);
        skipped++;
        continue;
      }
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, file.content);
      console.log(`  write  ${shown}`);
      written++;
    }
  }

  const deps = await missingDependencies(
    cwd,
    items.flatMap((item) => item.dependencies ?? []),
  );
  if (deps.length && flags.install !== false) {
    const pm = detectPackageManager(cwd);
    console.log(`\nInstalling ${deps.join(", ")} with ${pm}…`);
    await install(pm, deps, cwd);
  } else if (deps.length) {
    console.log(`\nNot installed (--no-install): ${deps.join(", ")}`);
  }

  console.log(
    `\nAdded ${items.map((i) => i.name).join(", ")}: ${written} file(s) written${
      skipped ? `, ${skipped} skipped` : ""
    }.`,
  );
}
