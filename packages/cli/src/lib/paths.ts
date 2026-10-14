import { existsSync } from "node:fs";
import { isAbsolute, join, normalize, relative, resolve, sep } from "node:path";
import { CliError } from "./api.js";

/**
 * Where a registry file lands in this project.
 *
 * Registry targets are written for a project without `src/`
 * (`components/once-ui/pro/Hero1.tsx`). Next.js apps that keep their code in
 * `src/` — every app the scaffolder creates does — get the same path under it.
 *
 * The target comes from a server, so it is checked like untrusted input: an
 * absolute path or one that climbs out of the project is refused.
 */
export function resolveTarget(cwd: string, target: string): string {
  const clean = normalize(target).replace(/^[/\\]+/, "");
  if (isAbsolute(target) || clean.split(/[/\\]/).includes("..")) {
    throw new CliError(`Refusing to write outside the project: ${target}`);
  }
  const root = resolve(cwd);
  const useSrc =
    existsSync(join(root, "src")) && !clean.startsWith(`src${sep}`) && !clean.startsWith("src/");
  const full = resolve(root, useSrc ? join("src", clean) : clean);
  const rel = relative(root, full);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new CliError(`Refusing to write outside the project: ${target}`);
  }
  return full;
}

/** A default package name from a directory name: lowercase, dashes, npm-safe. */
export function packageNameFrom(dir: string): string {
  const base = dir.split(/[/\\]/).filter(Boolean).pop() ?? "";
  const name = base
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return name || "once-ui-app";
}
