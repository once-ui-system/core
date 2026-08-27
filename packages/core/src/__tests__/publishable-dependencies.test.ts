import { describe, expect, it } from "vitest";
import pkg from "../../package.json";

/**
 * Every entry in `dependencies` is installed on every consumer machine, so each
 * one must resolve from the public registry at the version the tarball declares.
 *
 * `pnpm publish` rewrites the `workspace:` protocol to the depended-on package's
 * literal version. A workspace-only package left in `dependencies` therefore
 * ships as a hard runtime dependency pinned to a version that may not exist on
 * npm — and `npm install @once-ui-system/core` fails with E404 for everyone.
 *
 * This happened: 1.9.0 carried `"@once-ui-system/foundations": "workspace:*"` in
 * `dependencies` while foundations was unpublished and versioned 2.0.0-alpha.0.
 * `publint` and `arethetypeswrong` both pass on that tarball — they inspect the
 * package's own structure, not whether its dependency graph resolves — so this
 * class of break needs its own guard.
 *
 * Build-only workspace packages belong in `devDependencies`, which publish strips.
 */

describe("publishable dependencies", () => {
  it("declares no workspace-protocol runtime dependencies", () => {
    const workspaceDeps = Object.entries(pkg.dependencies ?? {})
      .filter(([, range]) => typeof range === "string" && range.startsWith("workspace:"))
      .map(([name]) => name);

    expect(workspaceDeps).toEqual([]);
  });

  it("declares no pre-release runtime dependencies", () => {
    // A stable release must not pin consumers to an alpha/beta/rc of anything.
    const prerelease = Object.entries(pkg.dependencies ?? {})
      .filter(([, range]) => typeof range === "string" && /-(alpha|beta|rc|next|canary)/.test(range))
      .map(([name, range]) => `${name}@${range}`);

    expect(prerelease).toEqual([]);
  });
});
