/**
 * Every built-in icon must render exactly what react-icons rendered before the
 * data was inlined.
 *
 * This is the guard on `scripts/generate-icons.mjs`: transcribed path data is
 * the kind of thing that goes subtly wrong — a dropped attribute, a stroke
 * default that no longer applies — and looks fine until someone notices an
 * icon is the wrong weight. react-icons stays a devDependency precisely so
 * this comparison can keep running.
 */
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import manifest from "../../scripts/icon-manifest.json";
import { iconLibrary } from "../icons";

const families: Record<string, () => Promise<Record<string, React.ComponentType>>> = {
  hi2: () => import("react-icons/hi2") as never,
  io5: () => import("react-icons/io5") as never,
  lu: () => import("react-icons/lu") as never,
  pi: () => import("react-icons/pi") as never,
};

const entries = Object.entries(manifest as Record<string, { family: string; symbol: string }>);

describe("built-in icons match their source set", () => {
  it("covers every registered icon", () => {
    expect(entries.length).toBe(Object.keys(iconLibrary).length);
  });

  for (const [name, { family, symbol }] of entries) {
    it(`${name} (${family}/${symbol})`, async () => {
      const mod = await families[family]();
      const Original = mod[symbol];
      expect(Original, `${symbol} missing from react-icons/${family}`).toBeDefined();

      const Inlined = iconLibrary[name as keyof typeof iconLibrary];
      expect(renderToStaticMarkup(<Inlined />)).toBe(renderToStaticMarkup(<Original />));
    });
  }
});
