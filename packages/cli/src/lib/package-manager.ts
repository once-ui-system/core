import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type PackageManager = "pnpm" | "yarn" | "bun" | "npm";

/** The project's package manager, read from its lockfile. npm when there is none. */
export function detectPackageManager(cwd: string): PackageManager {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "bun.lock")) || existsSync(join(cwd, "bun.lockb"))) return "bun";
  return "npm";
}

export function installArgs(pm: PackageManager, packages: string[]): string[] {
  return pm === "npm" ? ["install", ...packages] : ["add", ...packages];
}

/** Packages not yet listed in package.json's dependencies or devDependencies. */
export async function missingDependencies(cwd: string, wanted: string[]): Promise<string[]> {
  let declared: Record<string, unknown> = {};
  try {
    const pkg = JSON.parse(await readFile(join(cwd, "package.json"), "utf8"));
    declared = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies };
  } catch {
    // no package.json — everything is missing
  }
  return [...new Set(wanted)].filter((name) => !(name in declared)).sort();
}

export function install(pm: PackageManager, packages: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(pm, installArgs(pm, packages), {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${pm} exited with code ${code}`)),
    );
  });
}
