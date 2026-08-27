import { describe, expect, it } from "vitest";
import manifest from "../../ai/manifest.json";
import catalog from "../../ai/catalog.json";
import pkg from "../../package.json";

/**
 * The AI-consumer rule (RELEASING.md): the published ai/ harness artifacts
 * must describe the version being released. 1.8.2 shipped with a manifest
 * still stamped 1.8.1 — this test turns that drift class into a failure.
 * `pnpm build` regenerates the artifacts (generate-ai-spec runs inside it).
 */
describe("ai harness version sync", () => {
  it("ai/manifest.json version matches package.json", () => {
    expect(manifest.version).toBe(pkg.version);
  });

  it("ai/catalog.json version matches package.json", () => {
    expect(catalog.version).toBe(pkg.version);
  });
});
