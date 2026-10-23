import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

/**
 * `once-ui.lock.json`: which blocks `add` installed, and the hash of each file
 * as the registry sent it. `update` compares a file on disk with that hash to
 * tell an untouched file (safe to replace) from one you edited (kept).
 * Commit it with the blocks.
 */
export const LOCK_FILE = "once-ui.lock.json";

export type BlockLock = {
  /** Project-relative path (forward slashes) -> sha256 of the content the registry sent. */
  files: Record<string, string>;
};

export type Lock = { version: 1; blocks: Record<string, BlockLock> };

export const hashContent = (content: string | Buffer) =>
  createHash("sha256").update(content).digest("hex");

/** A path as the lock stores it: relative to the project, with `/` on every platform. */
export const lockPath = (cwd: string, full: string) => relative(cwd, full).split(sep).join("/");

export async function readLock(cwd: string): Promise<Lock> {
  try {
    const lock = JSON.parse(await readFile(join(cwd, LOCK_FILE), "utf8")) as Partial<Lock>;
    return { version: 1, blocks: lock.blocks ?? {} };
  } catch {
    return { version: 1, blocks: {} };
  }
}

export async function writeLock(cwd: string, lock: Lock) {
  const blocks = Object.fromEntries(
    Object.entries(lock.blocks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, entry]) => [
        name,
        {
          files: Object.fromEntries(
            Object.entries(entry.files).sort(([a], [b]) => a.localeCompare(b)),
          ),
        },
      ]),
  );
  await writeFile(join(cwd, LOCK_FILE), `${JSON.stringify({ version: 1, blocks }, null, 2)}\n`);
}
