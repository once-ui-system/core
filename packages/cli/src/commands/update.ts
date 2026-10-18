import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative } from "node:path";
import { type ApiClient, CliError } from "../lib/api.js";
import { hashContent, lockPath, readLock, writeLock } from "../lib/lock.js";
import { resolveTarget } from "../lib/paths.js";
import {
  blockId,
  blockList,
  fetchBlock,
  installMissing,
  plannedFiles,
  type RegistryItem,
  recordInLock,
  resolveBlocks,
  wireBlockIcons,
} from "./add.js";

export type UpdateFlags = { force?: boolean; dryRun?: boolean; install?: boolean; cwd?: string };

/** Where `add` puts blocks, so a project from before the lock file can still be updated. */
const INSTALL_DIR = "components/once-ui/pro";

type Action = "add" | "update" | "keep" | "unknown" | "same";

/**
 * Bring installed blocks up to the registry's current version.
 *
 * A file still matching what the registry sent at install time (the hash in
 * `once-ui.lock.json`) is replaced; one you edited is kept and named, unless
 * `--force`. Blocks the new versions import are added. Without names, every
 * block in the lock is updated; a project with no lock (blocks added before
 * the CLI kept one) is read from the block folder instead.
 */
export async function update(client: ApiClient, names: string[], flags: UpdateFlags) {
  const cwd = flags.cwd ?? process.cwd();
  const lock = await readLock(cwd);
  const cache = new Map<string, RegistryItem>();
  const fetchCached = async (id: string) => {
    const hit = cache.get(id) ?? (await fetchBlock(client, id));
    cache.set(id, hit);
    return hit;
  };

  let wanted = names.map(blockId);
  if (!wanted.length) wanted = Object.keys(lock.blocks);
  if (!wanted.length) wanted = await blocksOnDisk(cwd, fetchCached);
  if (!wanted.length) {
    throw new CliError("No blocks to update here. Add one with `once-ui add <block>`.");
  }

  const items = await resolveBlocks(wanted, fetchCached);

  // What the registry sent at install time, for every file any block owns.
  const installed = new Map<string, string>();
  for (const entry of Object.values(lock.blocks)) {
    for (const [path, hash] of Object.entries(entry.files)) installed.set(path, hash);
  }

  const counts: Record<Action, number> = { add: 0, update: 0, keep: 0, unknown: 0, same: 0 };
  const verb = flags.dryRun ? "would " : "";
  const planned = plannedFiles(cwd, items);
  for (const [path, file] of planned) {
    const shown = relative(cwd, path);
    const action = await decide(path, file.content, installed.get(lockPath(cwd, path)), flags);
    counts[action]++;
    if (action === "same") continue;
    if (action === "keep") {
      console.log(`  keep   ${shown} (edited — pass --force to replace it)`);
      continue;
    }
    if (action === "unknown") {
      console.log(
        `  keep   ${shown} (differs, and there is no record of the installed version — pass --force to replace it)`,
      );
      continue;
    }
    console.log(`  ${verb}${action.padEnd(6)} ${shown}`);
    if (flags.dryRun) continue;
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, file.content);
  }

  // Files a block used to ship and no longer does stay where they are: you may
  // import them elsewhere.
  for (const item of items) {
    const now = new Set(
      item.files.map((f) => lockPath(cwd, resolveTarget(cwd, f.target ?? f.path))),
    );
    for (const path of Object.keys(lock.blocks[item.name]?.files ?? {})) {
      if (!now.has(path) && existsSync(resolveTarget(cwd, path))) {
        console.log(`  left   ${path} (no longer part of ${item.name})`);
      }
    }
  }

  if (!flags.dryRun) {
    recordInLock(cwd, lock, items);
    await writeLock(cwd, lock);
    await wireBlockIcons(cwd, planned.keys());
    await installMissing(cwd, items, flags.install !== false);
  }

  const n = (count: number, done: string, planned: string) =>
    count ? `${count} ${flags.dryRun ? planned : done}` : "";
  const parts = [
    n(counts.update, "updated", "to update"),
    n(counts.add, "added", "to add"),
    n(counts.keep + counts.unknown, "kept", "kept"),
    n(counts.same, "already current", "already current"),
  ].filter(Boolean);
  const changed = counts.update + counts.add;
  console.log(
    `\n${blockList(items)}: ${parts.join(", ")}.${
      !changed && !counts.keep && !counts.unknown ? " Everything is up to date." : ""
    }${flags.dryRun ? " Nothing was written (--dry-run)." : ""}`,
  );
}

async function decide(
  path: string,
  incoming: string,
  installedHash: string | undefined,
  flags: UpdateFlags,
): Promise<Action> {
  if (!existsSync(path)) return "add";
  const local = await readFile(path, "utf8");
  if (local === incoming) return "same";
  if (flags.force || installedHash === hashContent(local)) return "update";
  return installedHash ? "keep" : "unknown";
}

/** Blocks found in the block folder, for projects that predate the lock. */
async function blocksOnDisk(
  cwd: string,
  fetchItem: (id: string) => Promise<RegistryItem>,
): Promise<string[]> {
  const dir = resolveTarget(cwd, INSTALL_DIR);
  if (!existsSync(dir)) return [];
  const found: string[] = [];
  for (const file of await readdir(dir)) {
    if (!file.endsWith(".tsx")) continue;
    const id = blockId(file.replace(/\.tsx$/, ""));
    try {
      await fetchItem(id);
      found.push(id);
    } catch (error) {
      // Your own component in the same folder, not a block: leave it out.
      if (!(error instanceof CliError && error.message.startsWith("No block named"))) throw error;
    }
  }
  return found;
}
