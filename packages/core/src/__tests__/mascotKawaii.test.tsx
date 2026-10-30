import { render as baseRender } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { baseMood, effectsFor, eyeGlyph, KAWAII } from "../modules/ai/kawaii";
import { Mascot } from "../modules/ai/Mascot";

const render = (ui: ReactElement) =>
  baseRender(ui, { wrapper: ({ children }) => <LayoutProvider>{children}</LayoutProvider> });

describe("kawaii moods", () => {
  it("draws each kawaii mood as its base mood", () => {
    for (const [mood, { base }] of Object.entries(KAWAII)) {
      expect(baseMood(mood)).toBe(base);
      const { container, unmount } = render(<Mascot mood={mood as keyof typeof KAWAII} />);
      expect(container.querySelector("[data-mood]")?.getAttribute("data-mood")).toBe(base);
      unmount();
    }
    expect(baseMood("happy")).toBe("happy");
  });

  it("adds the mood's effects, extra ones, or none", () => {
    expect([...effectsFor("love")]).toEqual(["heartEyes", "blush", "hearts"]);
    expect(effectsFor("love", false).size).toBe(0);
    expect([...effectsFor("happy", ["blush"])]).toEqual(["blush"]);
    expect(eyeGlyph(effectsFor("excited"))).toBe("star");
    expect(eyeGlyph(effectsFor("happy"))).toBeUndefined();
  });

  it("replaces the eyes with glyphs and draws the effects", () => {
    const { container } = render(<Mascot mood="love" />);
    expect(container.querySelectorAll('[class*="heart"]').length).toBeGreaterThanOrEqual(2);
    expect(container.querySelectorAll('[class*="blush"]').length).toBeGreaterThan(0);
    const plain = render(<Mascot mood="love" effects={false} />);
    expect(plain.container.querySelectorAll('[class*="heart"]').length).toBe(0);
  });
});
