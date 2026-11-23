/**
 * The built-in icons are Once UI's own set (once-ui-system/icons), copied into
 * `src/icons/data.ts` by `scripts/generate-icons.mjs`.
 *
 * Guards: no name an app could use in 2.x disappears, every icon is a line
 * icon on the shared 24 grid that follows `currentColor`, and the theme's
 * border style reaches the caps and joins.
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import names2x from "../../scripts/icon-names-2x.json";
import { iconLibrary } from "../icons";

const names = Object.keys(iconLibrary) as (keyof typeof iconLibrary)[];

describe("built-in icons", () => {
  it("keeps every 2.x name", () => {
    expect((names2x as string[]).filter((name) => !(name in iconLibrary))).toEqual([]);
  });

  it("ships the approved set", () => {
    expect(names.length).toBeGreaterThanOrEqual(178);
  });

  for (const name of names) {
    it(`${name} is a currentColor line icon on the 24 grid`, () => {
      const Icon = iconLibrary[name];
      const html = renderToStaticMarkup(<Icon />);
      expect(html).toContain('viewBox="0 0 24 24"');
      expect(html).toContain('stroke="currentColor"');
      expect(html).toContain('stroke-width="1.5"');
      expect(html).toMatch(/<path d="/);
      expect(html).toContain("stroke-linecap:var(--icon-linecap, round)");
    });
  }

  it("lets a caller's style win over the themed caps", () => {
    const Icon = iconLibrary.check;
    const html = renderToStaticMarkup(<Icon style={{ strokeLinecap: "butt" }} />);
    expect(html).toContain("stroke-linecap:butt");
  });
});
