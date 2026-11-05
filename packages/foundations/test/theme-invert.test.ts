import { createRequire } from "node:module";
import { join } from "node:path";
import * as sass from "sass";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { invert, themeSelector } = require("../scripts/theme-invert.cjs") as {
  invert: (css: string) => string;
  themeSelector: (theme: "light" | "dark") => string;
};

/**
 * `data-theme="invert"` (scripts/theme-invert.cjs): the shipped CSS spells
 * every `[data-theme=dark|light]` so it also matches an invert element whose
 * nearest themed ancestor is the other theme. The browser checks of the
 * cascade itself (nested themes, data-brand, data-solid, surfaces) were run
 * in Chromium against the built tokens.css; these pin the rewrite.
 */
describe("theme-invert", () => {
  it("matches invert of the other theme", () => {
    expect(themeSelector("dark")).toBe(
      ":is([data-theme=dark],[data-theme=invert]:where([data-theme=light] *)" +
        ":not(:where([data-theme=light] [data-theme=dark] *)))",
    );
  });

  it("keeps the specificity of [data-theme=…]: the extra branch weighs one attribute", () => {
    // Inside :is() the heaviest branch counts; everything past the invert
    // attribute sits in :where(), which weighs nothing.
    const branch = themeSelector("light").slice(":is([data-theme=light],".length, -1);
    expect(branch.replace(/:where\((?:[^()]|\([^()]*\))*\)/g, "")).toBe(
      "[data-theme=invert]:not()",
    );
  });

  it("rewrites quoted and unquoted values, and nothing else", () => {
    expect(invert('[data-theme="dark"] .a{x:1}')).toBe(`${themeSelector("dark")} .a{x:1}`);
    expect(invert("[data-theme=light][data-solid=color]{x:1}")).toBe(
      `${themeSelector("light")}[data-solid=color]{x:1}`,
    );
    const untouched = ":where([data-theme]){x:1}[data-theme=system]{y:2}:not([data-theme]){z:3}";
    expect(invert(untouched)).toBe(untouched);
  });

  it("runs once", () => {
    const once = invert("[data-theme=dark]{x:1}");
    expect(invert(once)).toBe(once);
  });

  it("covers every theme rule in the tokens", () => {
    const { css } = sass.compile(join(__dirname, "..", "scss", "tokens", "index.scss"));
    const out = invert(css);
    // With the rewritten selectors taken out, no literal theme is left.
    const stripped = out
      .split(themeSelector("dark"))
      .join("")
      .split(themeSelector("light"))
      .join("");
    expect(css).toMatch(/\[data-theme="?dark"?\]/);
    expect(stripped).not.toMatch(/\[data-theme="?(?:dark|light)"?\]/);
  });
});
