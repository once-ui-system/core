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
 * in review. This is the API contract of @once-ui-system/foundations.
 */

const SCSS_ROOT = join(__dirname, "..", "scss");

/**
 * Sass keeps `/* *\/` comments in the compiled output, and the extractors below
 * match on raw text. A comment in theme.scss mentioning `[data-scaling]` was
 * therefore recorded as part of the public selector surface, alongside the
 * four real `[data-scaling="90"]`-style rules. Prose is not API; strip it.
 */
const stripComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, "");

const compileEntry = (entry: string): string =>
  stripComments(compile(join(SCSS_ROOT, entry), { style: "expanded" }).css);

const unique = (values: string[]): string[] => [...new Set(values)].sort();

const extractCustomProperties = (css: string): string[] =>
  unique(css.match(/--[\w-]+(?=\s*:)/g) ?? []);

const extractClassSelectors = (css: string): string[] =>
  unique(css.match(/\.[a-zA-Z][\w-]*/g) ?? []);

/**
 * `[data-*]` selectors, with the value in double quotes however it was written.
 *
 * Sass drops the quotes around a value that is a valid identifier, so
 * `[data-theme="dark"]` in the source compiles to `[data-theme=dark]`, while
 * `[data-scaling="90"]` keeps them. The pattern used to require quotes, so
 * every theme, brand, accent, neutral, border, solid, surface, transition and
 * viz-style selector fell outside the snapshot: only the numeric ones were
 * guarded. Normalising the quotes records the selector as a consumer writes
 * it, and keeps the snapshot still if Sass ever changes how it quotes.
 */
const ATTRIBUTE_SELECTOR = /\[(data-[\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\]"'\s]+)))?\]/g;

const extractAttributeSelectors = (css: string): string[] =>
  unique(
    [...css.matchAll(ATTRIBUTE_SELECTOR)].map(([, name, double, single, bare]) => {
      const value = double ?? single ?? bare;
      return value === undefined ? `[${name}]` : `[${name}="${value}"]`;
    }),
  );

describe("css api surface", () => {
  it("reads an attribute selector whether or not its value is quoted", () => {
    const css = `[data-theme=dark] .a, [data-scaling="90"], [data-x='y'] b, [data-open] {}`;
    expect(extractAttributeSelectors(css)).toEqual([
      "[data-open]",
      '[data-scaling="90"]',
      '[data-theme="dark"]',
      '[data-x="y"]',
    ]);
    // The same selector, quoted or not, is one entry.
    expect(extractAttributeSelectors(`[data-theme=dark], [data-theme="dark"]`)).toEqual([
      '[data-theme="dark"]',
    ]);
  });

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
