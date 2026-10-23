import assert from "node:assert/strict";
import { test } from "node:test";
import { safeNextPath } from "./next.ts";

test("same-site paths pass", () => {
  assert.equal(safeNextPath("/invite/abc?x=1"), "/invite/abc?x=1");
});

test("anything that could leave the site falls back", () => {
  for (const bad of [null, "", "https://evil.example", "//evil.example", "/\\evil.example", "app"]) {
    assert.equal(safeNextPath(bad), "/app", String(bad));
  }
});
