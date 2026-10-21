import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Flex } from "../components/Flex";
import { Grid } from "../components/Grid";
import type { BorderStyle, SolidType, SurfaceStyle } from "../contexts/ThemeProvider";

/**
 * A themed subtree — a dark hero on a light page, a rounded toolbar, a
 * contrast button group — was raw `data-theme`/`data-border`/`data-solid`
 * attributes, untyped (Studio alone has ~250). `theme`, `themeBorder`,
 * `themeSolid` and `themeSurface` are the same attributes with
 * ThemeProvider's value unions behind them. `border` and `solid` already mean
 * colours on Flex, so the new names say which meaning they carry.
 */
const TOKENS = ["theme", "border"]
  .map((name) =>
    readFileSync(join(__dirname, `../../../foundations/scss/tokens/${name}.scss`), "utf8"),
  )
  .join("\n");

const THEMES = ["light", "dark"] as const;
const BORDERS: BorderStyle[] = ["rounded", "playful", "conservative"];
const SOLIDS: SolidType[] = ["color", "contrast", "inverse"];
const SURFACES: SurfaceStyle[] = ["filled", "translucent"];

const rootOf = (html: string) => html.slice(0, html.indexOf(">") + 1);

describe("typed theme props", () => {
  it("writes each one as its data attribute, on the server", () => {
    // Flex and Grid are each overloaded, so their union is not callable as JSX.
    for (const Component of [Flex, Grid] as React.ElementType[]) {
      // No LayoutProvider: the client path would throw.
      const root = rootOf(
        renderToStaticMarkup(
          <Component
            theme="dark"
            themeBorder="rounded"
            themeSolid="contrast"
            themeSurface="translucent"
          >
            x
          </Component>,
        ),
      );
      expect(root).toContain('data-theme="dark"');
      expect(root).toContain('data-border="rounded"');
      expect(root).toContain('data-solid="contrast"');
      expect(root).toContain('data-surface="translucent"');
      // The prop names themselves never reach the DOM.
      expect(root).not.toMatch(/\s(theme|themeborder|themesolid|themesurface)=/i);
    }
  });

  it("writes nothing when they are not set", () => {
    const root = rootOf(renderToStaticMarkup(<Flex>x</Flex>));
    expect(root).not.toMatch(/data-(theme|border|solid|surface)=/);
  });

  it("has a token rule behind every value the types allow", () => {
    const missing = [
      ...THEMES.map((v) => `[data-theme="${v}"]`),
      ...BORDERS.map((v) => `[data-border="${v}"]`),
      ...SOLIDS.map((v) => `[data-solid="${v}"]`),
      ...SURFACES.map((v) => `[data-surface="${v}"]`),
    ].filter((selector) => !TOKENS.includes(selector));
    expect(missing).toEqual([]);
  });

  it("wins over a raw attribute beside it, and leaves one alone when unset", () => {
    const root = rootOf(
      renderToStaticMarkup(
        <Flex theme="light" data-theme="dark" data-border="playful">
          x
        </Flex>,
      ),
    );
    expect(root).toContain('data-theme="light"');
    expect(root).not.toContain('data-theme="dark"');
    expect(root).toContain('data-border="playful"');
  });

  it("does not touch the showIn visibility prop", () => {
    // `showIn="dark"` shows an element only in a dark theme; `theme="dark"`
    // makes the subtree dark. One is a class, the other an attribute.
    const shown = rootOf(renderToStaticMarkup(<Flex showIn="dark">x</Flex>));
    expect(shown).toContain("dark-flex");
    expect(shown).not.toContain("data-theme");
    const themed = rootOf(renderToStaticMarkup(<Flex theme="dark">x</Flex>));
    expect(themed).not.toContain("dark-flex");
  });

  it("does not take system, which no data-theme rule matches", () => {
    // @ts-expect-error — `system` is resolved by ThemeProvider, not by CSS.
    const el = <Flex theme="system">x</Flex>;
    expect(el).toBeDefined();
  });
});
