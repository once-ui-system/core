import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { wrap, ORDER } = require("../scripts/css-layers.cjs") as {
  wrap: (css: string, layer: string) => string;
  ORDER: string;
};

/**
 * 3.0 ships every Once UI stylesheet in a cascade layer, so an app's
 * unlayered CSS overrides it without `!important` (scripts/css-layers.cjs).
 */
describe("css-layers", () => {
  it("puts the order statement first and the CSS in its layer", () => {
    expect(wrap(".a{color:red}", "once-ui.styles")).toBe(
      `${ORDER}\n@layer once-ui.styles {\n.a{color:red}\n}\n`,
    );
  });

  it("keeps @charset, @import and a byte-order mark in front", () => {
    const out = wrap('@charset "UTF-8";\n@import url(x.css);\n.a{}', "once-ui.components");
    expect(out.startsWith(`@charset "UTF-8";\n@import url(x.css);\n${ORDER}\n`)).toBe(true);
    expect(wrap("﻿.a{}", "once-ui.tokens").startsWith(`﻿${ORDER}`)).toBe(true);
  });

  it("leaves the source map comment last, outside the layer", () => {
    expect(wrap(".a{}\n/*# sourceMappingURL=a.css.map */\n", "once-ui.tokens")).toMatch(
      /\n\}\n\/\*# sourceMappingURL=a\.css\.map \*\/\n$/,
    );
  });

  it("wraps once", () => {
    const once = wrap(".a{}", "once-ui.styles");
    expect(wrap(once, "once-ui.styles")).toBe(once);
  });

  it("rejects a layer outside the order", () => {
    expect(() => wrap(".a{}", "once-ui.extra")).toThrow(/unknown layer/);
  });
});
