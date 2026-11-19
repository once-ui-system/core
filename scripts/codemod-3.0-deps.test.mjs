/**
 * Regression tests for the 2.x → 3.0 codemod's package.json report.
 *
 * Run: node --test scripts/
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dependencyReports, lowestMajor, nearestPackage, packageSkipReason } from "./codemod-3.0-deps.mjs";

describe("lowestMajor", () => {
  it("reads the major a range starts from", () => {
    assert.equal(lowestMajor("^18.3.1"), 18);
    assert.equal(lowestMajor("~19.0.0"), 19);
    assert.equal(lowestMajor(">=18"), 18);
    assert.equal(lowestMajor("19"), 19);
    assert.equal(lowestMajor("latest"), null);
    assert.equal(lowestMajor("*"), null);
  });
});

describe("dependencyReports", () => {
  it("reports React below 19 and a recharts dependency", () => {
    const out = dependencyReports({
      dependencies: { react: "^18.3.1", "react-dom": "^18.3.1", recharts: "^2.15.0" },
    });
    assert.equal(out.length, 3);
    assert.match(out[0], /^react \^18\.3\.1: .*React 19/);
    assert.match(out[1], /^react-dom /);
    assert.match(out[2], /^recharts: .*uninstall/);
  });

  it("says nothing for a 3.0-ready package.json", () => {
    assert.deepEqual(dependencyReports({ dependencies: { react: "^19.2.0", "react-dom": "19.2.0" } }), []);
    assert.deepEqual(dependencyReports({ dependencies: { react: "latest" } }), []);
    assert.deepEqual(dependencyReports({}), []);
  });
});

describe("nearestPackage", () => {
  it("finds the package.json above a source folder", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "codemod-deps-"));
    try {
      fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "app" }));
      fs.mkdirSync(path.join(root, "src"));
      const found = nearestPackage(path.join(root, "src"));
      assert.equal(found?.pkg.name, "app");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("packageSkipReason", () => {
  const on = (range) => ({ dependencies: { "@once-ui-system/core": range } });
  it("leaves alone a nested package that is not on core", () => {
    assert.match(packageSkipReason({ dependencies: { "@once-ui-system/native": "^1.0.0" } }, "^3.0.0"), /does not depend/);
    assert.match(packageSkipReason({}, null), /does not depend/);
  });
  it("leaves alone a nested package on another major than the app", () => {
    assert.match(packageSkipReason(on("^2.2.0"), "^3.0.0-rc.0"), /pins @once-ui-system\/core \^2\.2\.0/);
    assert.match(packageSkipReason(on("^3.0.0"), "^2.8.0"), /pins/);
  });
  it("rewrites a nested package on the app's major, or any core package under a root without core", () => {
    assert.equal(packageSkipReason(on("^2.8.0"), "^2.2.0"), null);
    assert.equal(packageSkipReason(on("workspace:*"), "^2.8.0"), null);
    assert.equal(packageSkipReason(on("^2.8.0"), null), null);
  });
});

describe("the CLI on a repository root", () => {
  const CLI = fileURLToPath(new URL("./codemod-3.0.mjs", import.meta.url));
  it("skips sub-packages that are not on the app's core", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "codemod-scope-"));
    try {
      const write = (rel, text) => {
        fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
        fs.writeFileSync(path.join(root, rel), text);
      };
      const toast = 'export const t = (addToast) => addToast({ variant: "success", message: "Saved" });\n';
      write("package.json", JSON.stringify({ dependencies: { "@once-ui-system/core": "^2.8.0" } }));
      write("src/app.tsx", `import { Button } from "@once-ui-system/core";\n${toast}`);
      write("native/package.json", JSON.stringify({ dependencies: { "@once-ui-system/native": "^1.0.0" } }));
      write("native/app.tsx", toast);
      write("capture/package.json", JSON.stringify({ dependencies: { "@once-ui-system/core": "^3.0.0" } }));
      write("capture/app.tsx", `import { Button } from "@once-ui-system/core";\n${toast}`);
      const r = spawnSync(process.execPath, [CLI, root, "--dry"], { encoding: "utf8" });
      assert.equal(r.status, 0, r.stderr);
      assert.match(r.stdout, /Skipped 2 packages/);
      assert.match(r.stdout, /native: does not depend/);
      assert.match(r.stdout, /capture: pins/);
      assert.doesNotMatch(r.stdout, /native[\\/]app\.tsx/);
      const all = spawnSync(process.execPath, [CLI, root, "--dry", "--all-packages"], { encoding: "utf8" });
      assert.doesNotMatch(all.stdout, /Skipped/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
