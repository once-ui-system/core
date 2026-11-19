import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { isOwnSource } = require("../../scripts/generate-ai-spec.cjs");

/**
 * TypeScript names files with forward slashes everywhere; `path.join` uses
 * backslashes on Windows. The spec generator compared the two as they were,
 * so on Windows no file counted as the package's own and a build wrote a spec
 * with no `types`.
 */
describe("isOwnSource", () => {
  it("matches a file under src on Windows, whatever the slashes or drive-letter case", () => {
    const src = "C:\\git\\once-ui-core\\packages\\core\\src";
    expect(
      isOwnSource("C:/git/once-ui-core/packages/core/src/components/Icon.tsx", src, "win32"),
    ).toBe(true);
    expect(isOwnSource("c:/git/once-ui-core/packages/core/src/types.ts", src, "win32")).toBe(true);
    expect(isOwnSource("C:\\git\\once-ui-core\\packages\\core\\src\\icons.ts", src, "win32")).toBe(
      true,
    );
  });

  it("matches a file under src on POSIX", () => {
    expect(
      isOwnSource("/repo/packages/core/src/types.ts", "/repo/packages/core/src", "linux"),
    ).toBe(true);
  });

  it("leaves out files outside src, including a sibling that only shares the prefix", () => {
    const src = "C:\\repo\\packages\\core\\src";
    expect(isOwnSource("C:/repo/packages/core/node_modules/react/index.d.ts", src, "win32")).toBe(
      false,
    );
    expect(isOwnSource("C:/repo/packages/core/src-old/types.ts", src, "win32")).toBe(false);
    expect(
      isOwnSource("/repo/packages/core/srcx/types.ts", "/repo/packages/core/src", "linux"),
    ).toBe(false);
  });
});
