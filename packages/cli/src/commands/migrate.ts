import { spawn } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { CliError } from "../lib/api.js";
import { detectPackageManager, installArgs } from "../lib/package-manager.js";

export type MigrateFlags = {
  dryRun?: boolean;
  force?: boolean;
  css?: boolean;
  cwd?: string;
  /** npm registry to read `@once-ui-system/core`'s versions from. */
  registry?: string;
  /** Where the codemods are read from: `<source>/v<version>/scripts/<file>`. */
  source?: string;
};

const PACKAGE = "@once-ui-system/core";
const REGISTRY = "https://registry.npmjs.org";
const SOURCE = "https://raw.githubusercontent.com/once-ui-system/core";

/** The codemod that brings a project up to each major, and the flags it takes. */
const CODEMODS: Record<number, { entry: string; flags: (keyof MigrateFlags)[] }> = {
  2: { entry: "codemod-2.0.mjs", flags: ["dryRun", "css"] },
  3: { entry: "codemod-3.0.mjs", flags: ["dryRun", "force"] },
};

const FLAG_NAMES: Partial<Record<keyof MigrateFlags, string>> = {
  dryRun: "--dry",
  force: "--force",
  css: "--css",
};

/**
 * Run the codemod for a Once UI major over a project.
 *
 * The codemods live in the core repository, next to the components they
 * describe. They are read at the tag of the newest published release of that
 * major, so the rewrite always matches the version you are about to install,
 * and the CLI needs no release of its own when a codemod learns something.
 */
export async function migrate(
  to: string | undefined,
  dir: string | undefined,
  flags: MigrateFlags,
) {
  const major = majorOf(to);
  const codemod = CODEMODS[major];
  if (!codemod) {
    throw new CliError(
      `There is no migration to "${to}". Pick one of: ${Object.keys(CODEMODS)
        .map((m) => `${m}.0`)
        .join(", ")}.`,
    );
  }
  const cwd = flags.cwd ?? process.cwd();
  const target = resolve(cwd, dir ?? ".");
  if (!existsSync(target) || !statSync(target).isDirectory()) {
    throw new CliError(`${dir} is not a folder.`);
  }

  const version = await newestRelease(flags.registry ?? REGISTRY, major);
  console.log(`Migrating ${relative(cwd, target) || "."} to ${PACKAGE} ${version}`);

  // The real path: a codemod only runs when argv[1] matches its own resolved
  // URL, and macOS's tmpdir is a symlink.
  const scripts = await realpath(await mkdtemp(join(tmpdir(), "once-ui-migrate-")));
  try {
    await download(`${flags.source ?? SOURCE}/v${version}/scripts`, codemod.entry, scripts);
    const args = codemod.flags.filter((flag) => flags[flag]).map((flag) => FLAG_NAMES[flag]);
    const code = await run(join(scripts, codemod.entry), [target, ...(args as string[])], cwd);
    if (code !== 0) throw new CliError(`The codemod stopped (exit code ${code}).`);
  } finally {
    await rm(scripts, { recursive: true, force: true });
  }

  if (!flags.dryRun) {
    const pm = detectPackageManager(target);
    console.log(
      `\nNext: ${pm} ${installArgs(pm, [`${PACKAGE}@${version}`]).join(" ")}, then review the changes and the lines marked "fix by hand".`,
    );
  }
}

/** "3.0", "3", "v3", "3.0.0" → 3. */
export function majorOf(to: string | undefined): number {
  const match = /^v?(\d+)(\.\d+){0,2}$/.exec(to ?? "");
  if (!match) throw new CliError("Name the version to migrate to: `once-ui migrate 3.0 [dir]`.");
  return Number(match[1]);
}

/** The newest version of the major among the package's dist-tags: `latest` before `next`. */
export async function newestRelease(registry: string, major: number): Promise<string> {
  const res = await fetch(`${registry}/${PACKAGE}`, {
    headers: { accept: "application/vnd.npm.install-v1+json", "user-agent": "once-ui-cli" },
  });
  if (!res.ok) throw new CliError(`Couldn't read ${PACKAGE}'s versions (${res.status}).`);
  const body = (await res.json()) as { "dist-tags"?: Record<string, string> };
  const tags = body["dist-tags"] ?? {};
  const candidates = ["latest", "next", ...Object.keys(tags)]
    .map((tag) => tags[tag])
    .filter((v): v is string => !!v && Number(v.split(".")[0]) === major);
  if (!candidates.length) {
    throw new CliError(`${PACKAGE} ${major}.0 isn't published yet, so there is no codemod for it.`);
  }
  return candidates[0];
}

/**
 * Fetch a codemod and every codemod module it imports (`./codemod-….mjs`)
 * into `into`. Only sibling modules with that name shape are followed, so
 * nothing outside the scripts folder can be requested or written.
 */
export async function download(base: string, entry: string, into: string) {
  const queue = [entry];
  const seen = new Set(queue);
  while (queue.length) {
    const file = queue.shift() as string;
    const res = await fetch(`${base}/${file}`, { headers: { "user-agent": "once-ui-cli" } });
    if (!res.ok) throw new CliError(`Couldn't download the codemod ${file} (${res.status}).`);
    const text = await res.text();
    await writeFile(join(into, file), text);
    for (const [, name] of text.matchAll(/from\s+["']\.\/(codemod-[\w.-]+\.mjs)["']/g)) {
      if (seen.has(name)) continue;
      seen.add(name);
      queue.push(name);
    }
  }
  return [...seen];
}

function run(script: string, args: string[], cwd: string): Promise<number> {
  return new Promise((done, fail) => {
    const child = spawn(process.execPath, [script, ...args], { cwd, stdio: "inherit" });
    child.on("error", fail);
    child.on("exit", (code) => done(code ?? 1));
  });
}
