/**
 * Once UI 2.x → 3.0 codemod: what the project's package.json needs.
 *
 * The codemod rewrites source; the dependency changes 3.0 asks for are the
 * owner's to make (installing is a step of its own), so they are reported:
 *   - B1: React 19 is the floor for `react` and `react-dom`;
 *   - charts draw their own SVG, so `recharts` is no longer needed by Once UI.
 * Only the nearest package.json at or above the directory is read.
 */
import fs from "node:fs";
import path from "node:path";

/** The nearest package.json at or above `dir`: `{ file, pkg }`, or null. */
export function nearestPackage(dir) {
  let d = path.resolve(dir);
  for (;;) {
    const file = path.join(d, "package.json");
    if (fs.existsSync(file)) {
      try {
        return { file, pkg: JSON.parse(fs.readFileSync(file, "utf8")) };
      } catch {
        return null;
      }
    }
    const up = path.dirname(d);
    if (up === d) return null;
    d = up;
  }
}

/** The lowest major a version range allows (`^18.3.1` → 18), or null when it says nothing (`latest`, `*`, a URL). */
export function lowestMajor(range) {
  const m = /^\s*(?:[\^~>=v]|>=)*\s*(\d+)(?:\.|$|\s)/.exec(String(range ?? ""));
  return m ? Number(m[1]) : null;
}

/** One line per dependency change 3.0 needs, for a parsed package.json. */
export function dependencyReports(pkg) {
  const all = { ...pkg?.peerDependencies, ...pkg?.devDependencies, ...pkg?.dependencies };
  const out = [];
  for (const name of ["react", "react-dom"]) {
    const major = name in all ? lowestMajor(all[name]) : null;
    if (major !== null && major < 19) out.push(`${name} ${all[name]}: Once UI 3.0 needs React 19 or later; install ${name}@19`);
  }
  if ("recharts" in all)
    out.push(
      "recharts: Once UI's charts draw their own SVG in 3.0 and no longer use it; uninstall it unless your own code imports it",
    );
  return out;
}
