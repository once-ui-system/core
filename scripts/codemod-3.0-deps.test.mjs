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
import { dependencyReports, lowestMajor, nearestPackage } from "./codemod-3.0-deps.mjs";

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
