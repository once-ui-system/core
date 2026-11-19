import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { wrap } = require("../scripts/css-layers.cjs") as { wrap: (css: string) => string };

const ORDER = "@layer properties, theme, base, once-ui, components, utilities;\n";

/**
 * 3.0 ships every Once UI stylesheet in the `once-ui` cascade layer, so an
 * app's unlayered CSS overrides it without `!important` (scripts/css-layers.cjs).
 */
describe("css-layers", () => {
  it("puts the CSS in the once-ui layer", () => {
    expect(wrap(".a{color:red}")).toBe(`${ORDER}@layer once-ui {\n.a{color:red}\n}\n`);
  });

  it("keeps @charset, @import and a byte-order mark in front", () => {
    expect(wrap('@charset "UTF-8";\n@import url(x.css);\n.a{}')).toBe(
      `@charset "UTF-8";\n@import url(x.css);\n${ORDER}@layer once-ui {\n.a{}\n}\n`,
    );
    expect(wrap("﻿.a{}")).toBe(`﻿${ORDER}@layer once-ui {\n.a{}\n}\n`);
  });

  it("leaves the source map comment last, outside the layer", () => {
    expect(wrap(".a{}\n/*# sourceMappingURL=a.css.map */\n")).toBe(
      `${ORDER}@layer once-ui {\n.a{}\n}\n/*# sourceMappingURL=a.css.map */\n`,
    );
  });

  it("names Tailwind's layers around once-ui, so preflight sits under it and utilities over it", () => {
    expect(wrap(".a{}").startsWith(ORDER)).toBe(true);
  });

  it("wraps once", () => {
    const once = wrap(".a{}");
    expect(wrap(once)).toBe(once);
  });
});
