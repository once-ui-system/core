import { join } from "node:path";
import { compile } from "sass";
import { describe, expect, it } from "vitest";

/**
 * Guards the compiled CSS API surface (rfcs/2026-08-once-ui-2-architecture.md §5.5).
 *
 * Consumers depend on token custom-property names (`--brand-background-strong`)
 * and utility class names (`.p-16`, `.radius-m`) as a public API. This test
 * compiles the SCSS sources and snapshots the *names only* — values may change
 * freely (design tweaks), but a rename or removal fails CI until the snapshot
 * is intentionally updated (`pnpm vitest run -u`), making the change visible
 * in review. This becomes the API contract of @once-ui-system/foundations
 * after the 2.0 split.
 */

const SRC_ROOT = join(__dirname, "..");

const compileEntry = (entry: string): string =>
  compile(join(SRC_ROOT, entry), { style: "expanded" }).css;

const unique = (values: string[]): string[] => [...new Set(values)].sort();

const extractCustomProperties = (css: string): string[] =>
  unique(css.match(/--[\w-]+(?=\s*:)/g) ?? []);

const extractClassSelectors = (css: string): string[] =>
  unique(css.match(/\.[a-zA-Z][\w-]*/g) ?? []);

const extractAttributeSelectors = (css: string): string[] =>
  unique(css.match(/\[data-[\w-]+(?:=["'][^"']*["'])?\]/g) ?? []);

describe("css api surface", () => {
  it("tokens.css custom property names are stable", async () => {
    const css = compileEntry("tokens/index.scss");
    await expect(extractCustomProperties(css).join("\n")).toMatchFileSnapshot(
      "./__snapshots__/tokens-custom-properties.txt",
    );
  });

  it("tokens.css theme/scheme attribute selectors are stable", async () => {
    const css = compileEntry("tokens/index.scss");
    await expect(extractAttributeSelectors(css).join("\n")).toMatchFileSnapshot(
      "./__snapshots__/tokens-attribute-selectors.txt",
    );
  });

  it("styles.css utility class names are stable", async () => {
    const css = compileEntry("styles/index.scss");
    await expect(extractClassSelectors(css).join("\n")).toMatchFileSnapshot(
      "./__snapshots__/styles-class-names.txt",
    );
  });
});
