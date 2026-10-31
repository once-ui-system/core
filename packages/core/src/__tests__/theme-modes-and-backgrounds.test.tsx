import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Text } from "../components";
import { ThemeInit } from "../components/ThemeInit";
import { ThemeProvider } from "../contexts/ThemeProvider";
import { expectNoAxeViolations } from "../test/axe";
import { customSchemeProperties, customSchemeThemeProperties } from "../utils/colorScheme";
import { themeSelector, themeStyle } from "../utils/themeCss";

const LIGHT = themeSelector("light");
const DARK = themeSelector("dark");

/**
 * Gaps agents hit after 2.3's scales: one ramp served both themes (a lime
 * accent tuned for dark was wrong on light), the light page and filled
 * surface could only change through CSS overrides, `.font-strong` tied body
 * and label weights to display's, and a `data-theme` subtree kept the text
 * colour of the page around it.
 */

const root = document.documentElement;
const FOUNDATIONS = join(__dirname, "../../../foundations/scss");
const TYPOGRAPHY = readFileSync(join(FOUNDATIONS, "styles/typography.generated.scss"), "utf8");

const light = { 100: "#0B1A00", 600: "#4E7A00", 1200: "#F6FBEA" };
const dark = { 100: "#101A04", 600: "#B8F23A", 1200: "#F4FFE0" };

const sheets: HTMLStyleElement[] = [];
const addCss = (css: string) => {
  const sheet = document.createElement("style");
  sheet.textContent = css;
  document.head.appendChild(sheet);
  sheets.push(sheet);
};

/** The `<style>` ThemeInit renders, as text. */
const themeInitCss = (config: Parameters<typeof ThemeInit>[0]["config"]) => {
  const html = renderToString(<ThemeInit config={config} />);
  return html.match(/<style id="theme-init-schemes">(.*?)<\/style>/)?.[1] ?? "";
};

afterEach(() => {
  for (const sheet of sheets.splice(0)) sheet.remove();
  localStorage.clear();
  root.removeAttribute("style");
  for (const name of root.getAttributeNames()) {
    if (name.startsWith("data-")) root.removeAttribute(name);
  }
});

describe("per-theme scheme scales", () => {
  it("leaves a flat scale exactly as customSchemeProperties gives it", () => {
    const flat = customSchemeThemeProperties({}, { brand: light });
    expect(flat.root).toEqual(customSchemeProperties({}, { brand: light }));
    expect(flat.light).toEqual({});
    expect(flat.byTheme).toEqual([]);
  });

  it("splits a per-theme scale, and a theme left out takes the other's", () => {
    const both = customSchemeThemeProperties({}, { accent: { light, dark } });
    expect(both.root).toEqual({});
    expect(both.light["--scheme-accent-600"]).toBe("#4E7A00");
    expect(both.dark["--scheme-accent-600"]).toBe("#B8F23A");
    expect(both.light["--scheme-accent-600-30"]).toBeTruthy();

    const lightOnly = customSchemeThemeProperties({}, { accent: { light } });
    expect(lightOnly.dark).toEqual(lightOnly.light);

    // A seed fills what a theme's scale leaves out, in each theme.
    const seeded = customSchemeThemeProperties({ accent: "#5A93FC" }, { accent: { dark } });
    expect(seeded.dark["--scheme-accent-600"]).toBe("#B8F23A");
    expect(seeded.light["--scheme-accent-600"]).toBe("#B8F23A");
    expect(seeded.light["--scheme-accent-300"]).toBe(
      customSchemeProperties({ accent: "#5A93FC" })["--scheme-accent-300"],
    );
  });

  it("ThemeInit renders each theme's ramp on the server and implies custom", () => {
    const html = renderToString(<ThemeInit config={{ accentScale: { light, dark } }} />);
    expect(html).toContain(
      `html:root[data-theme="light"],html:root ${LIGHT}{--scheme-accent-100:#0B1A00;`,
    );
    expect(html).toContain(`${DARK}{--scheme-accent-100:#101A04;`);
    // The subtree reads its own steps, not the ones <html> resolved.
    expect(html).toContain(
      'html:root[data-accent="custom"] [data-theme]{--function-accent-100:var(--scheme-accent-100);',
    );
    expect(html).toContain('"accent":"custom"');
    expect(html).not.toContain("accent-scale");
  });

  it("ThemeInit output for a flat scale is unchanged", () => {
    expect(themeInitCss({ brandScale: { 600: "#18372A" } })).toMatch(
      /^html:root\{--scheme-brand-600:#18372A;[^}]*\}$/,
    );
  });

  it("a dark subtree on a light page gets the dark ramp", () => {
    addCss(themeInitCss({ brandScale: { light, dark } }));
    root.setAttribute("data-theme", "light");
    root.setAttribute("data-brand", "custom");
    const { getByTestId } = render(
      <div data-theme="dark" data-testid="hero">
        x
      </div>,
    );
    expect(getComputedStyle(root).getPropertyValue("--scheme-brand-600").trim()).toBe("#4E7A00");
    const hero = getComputedStyle(getByTestId("hero"));
    expect(hero.getPropertyValue("--scheme-brand-600").trim()).toBe("#B8F23A");
    expect(hero.getPropertyValue("--function-brand-600").trim()).toBe("var(--scheme-brand-600)");
  });

  it("an invert subtree takes the ramp of the theme it inverts to", () => {
    addCss(themeInitCss({ brandScale: { light, dark } }));
    root.setAttribute("data-brand", "custom");
    for (const [page, expected] of [
      ["light", "#B8F23A"],
      ["dark", "#4E7A00"],
    ] as const) {
      root.setAttribute("data-theme", page);
      const { getByTestId, unmount } = render(
        <div data-theme="invert" data-testid="band">
          x
        </div>,
      );
      expect(
        getComputedStyle(getByTestId("band")).getPropertyValue("--scheme-brand-600").trim(),
      ).toBe(expected);
      unmount();
    }
  });

  it("ThemeProvider writes per-theme rules to a stylesheet, not inline", () => {
    const { unmount } = render(
      <ThemeProvider brandScale={{ light, dark }}>
        <span />
      </ThemeProvider>,
    );
    const sheet = document.head.querySelector("style[data-once-ui-theme-style]");
    expect(sheet?.textContent).toContain(`${DARK}{--scheme-brand-100:#101A04;`);
    // An inline value would beat the per-theme rules in both themes.
    expect(root.style.getPropertyValue("--scheme-brand-600")).toBe("");
    expect(root.getAttribute("data-brand")).toBe("custom");
    unmount();
    expect(document.head.querySelector("style[data-once-ui-theme-style]")).toBeNull();
  });
});

describe("page and surface backgrounds", () => {
  it("takes a token or a colour, once or per theme", () => {
    const { css } = themeStyle({
      seeds: {},
      scales: {},
      pageBackground: { light: "#F7F5EF", dark: "neutral-background-strong" },
      surfaceBackground: "--my-card",
    });
    expect(css).toContain(`html:root ${LIGHT}{--page-background:#F7F5EF;}`);
    expect(css).toContain(`html:root ${DARK}{--page-background:var(--neutral-background-strong);}`);
    expect(css).toContain(
      `html:root[data-surface="filled"] ${LIGHT}{--surface-background:var(--my-card);}`,
    );
    expect(css).toContain(`${DARK}{--surface-background:var(--my-card);}`);
  });

  it("a theme left out keeps the stylesheet's value", () => {
    const { css } = themeStyle({ seeds: {}, scales: {}, pageBackground: { light: "#fff" } });
    expect(css).not.toContain('html:root[data-theme="dark"]');
    expect(css).not.toContain(DARK);
  });

  it("drops a value that could end the declaration", () => {
    const { css } = themeStyle({
      seeds: {},
      scales: { brand: { 600: "red;}body{display:none" } },
      pageBackground: "red;}body{display:none",
      surfaceBackground: "</style><script>",
    });
    expect(css).toBe("");
  });

  it("ThemeInit renders them on the server and keeps the keys off <html>", () => {
    const html = renderToString(
      <ThemeInit config={{ pageBackground: "#F7F5EF", surfaceBackground: { light: "#fff" } }} />,
    );
    expect(html).toContain("--page-background:#F7F5EF");
    expect(html).toContain("--surface-background:#fff");
    expect(html).not.toContain('"page-background"');
    expect(html).not.toContain('"surface-background"');
  });

  it("outranks foundations' light-page and filled-surface rules", () => {
    addCss(`[data-theme="light"]{--page-background:var(--function-neutral-1200)}
[data-surface="filled"][data-theme="light"],[data-surface="filled"] [data-theme="light"]{--surface-background:var(--neutral-background-weak)}`);
    addCss(themeInitCss({ pageBackground: "#F7F5EF", surfaceBackground: "#FFFDF8" }));
    root.setAttribute("data-theme", "light");
    root.setAttribute("data-surface", "filled");
    const { getByTestId } = render(<div data-theme="light" data-testid="card" />);
    const page = getComputedStyle(root);
    expect(page.getPropertyValue("--page-background").trim()).toBe("#F7F5EF");
    expect(page.getPropertyValue("--surface-background").trim()).toBe("#FFFDF8");
    expect(
      getComputedStyle(getByTestId("card")).getPropertyValue("--surface-background").trim(),
    ).toBe("#FFFDF8");
  });

  it("ThemeProvider applies them without ThemeInit", () => {
    render(
      <ThemeProvider pageBackground={{ light: "#F7F5EF" }}>
        <span />
      </ThemeProvider>,
    );
    expect(document.head.querySelector("style[data-once-ui-theme-style]")?.textContent).toContain(
      "--page-background:#F7F5EF",
    );
  });
});

describe("type weights per family", () => {
  it("keeps every family on the display ramp until its own variable is set", () => {
    for (const family of ["heading", "body", "label", "code"]) {
      expect(TYPOGRAPHY).toContain(
        `:where(.font-${family}).font-strong,\n:where(.font-${family}) > .font-strong {\n  font-weight: var(--font-${family}-weight-strong, var(--font-weight-display-strong));`,
      );
    }
    // Display itself still reads its own ramp directly.
    expect(TYPOGRAPHY).toContain(
      ".font-strong {\n  font-weight: var(--font-weight-display-strong);",
    );
    expect(TYPOGRAPHY).not.toContain("--font-display-weight-");
  });

  it("stays at one class's specificity, so a later class still overrides it", () => {
    addCss(TYPOGRAPHY);
    addCss(".override { font-weight: 800; }");
    const { getByTestId } = render(
      <>
        <span className="font-body font-strong" data-testid="body" />
        <span className="font-body font-strong override" data-testid="override" />
      </>,
    );
    expect(getComputedStyle(getByTestId("body")).fontWeight).toBe(
      "var(--font-body-weight-strong, var(--font-weight-display-strong))",
    );
    expect(getComputedStyle(getByTestId("override")).fontWeight).toBe("800");
  });
});

describe("text colour in a themed subtree", () => {
  // jsdom resolves no var(), so the page colour is a literal: what a subtree
  // shows tells whether it inherited the page's colour or read its own.
  const PAGE = "rgb(1, 2, 3)";

  it("reads the subtree's own token instead of inheriting the page's colour", async () => {
    addCss(TYPOGRAPHY);
    addCss(".neutral-on-background-weak { color: var(--neutral-on-background-weak); }");
    const { container, getByTestId } = render(
      <div style={{ color: PAGE }}>
        <p data-testid="plain">page</p>
        <div data-theme="dark" data-testid="hero">
          <Text data-testid="text">hero</Text>
        </div>
        <div data-theme="dark" className="neutral-on-background-weak" data-testid="weak" />
      </div>,
    );
    // Untouched: nothing without data-theme gets a rule it did not have.
    expect(getComputedStyle(getByTestId("plain")).color).toBe(PAGE);
    expect(getComputedStyle(getByTestId("hero")).color).toBe("var(--neutral-on-background-strong)");
    expect(getComputedStyle(getByTestId("text")).color).toBe("var(--neutral-on-background-strong)");
    // A colour class on the subtree still wins.
    expect(getComputedStyle(getByTestId("weak")).color).toBe("var(--neutral-on-background-weak)");
    await expectNoAxeViolations(container);
  });
});
