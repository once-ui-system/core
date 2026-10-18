import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * StylePanel merges its labels and scrolls its swatch strips as core's own
 * controls do, through copies of two of core's internal helpers (they are not
 * public API). These hold each copy to the original, word for word, so a
 * change to one fails here until the other follows. Workspace only: the
 * published package has no tests.
 */
const CORE = path.resolve(__dirname, "../../../core/src/internal");
const OWN = path.resolve(__dirname, "../internal");
const body = (file: string) =>
  readFileSync(file, "utf8")
    .replace(/^(\/\/[^\n]*\n)+\n?/, "")
    .trim();

describe("copies of core's internal helpers", () => {
  it.each(["labels.ts", "reveal.ts"])("%s is core's, word for word", (file) => {
    expect(body(path.join(OWN, file))).toBe(body(path.join(CORE, file)));
  });
});
