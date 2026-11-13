import { describe, expect, it } from "vitest";
import { placeTooltip } from "../modules/data/utils/placeTooltip";

/**
 * A chart tooltip glides from point to point (a CSS transition on its
 * transform), but a tooltip that has just been shown lands in place.
 */

const sized = (tag: string, size: Record<string, number>) => {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(size)) {
    Object.defineProperty(el, key, { configurable: true, value });
  }
  return el;
};

const box = () => sized("div", { clientWidth: 400, clientHeight: 200 });
const tip = () => sized("div", { offsetWidth: 100, offsetHeight: 40 });

// Records each value the tooltip's transition is set to.
const watchTransition = (el: HTMLElement) => {
  const seen: string[] = [];
  const style = el.style;
  const proto = Object.getPrototypeOf(style);
  const descriptor = Object.getOwnPropertyDescriptor(proto, "transition");
  Object.defineProperty(style, "transition", {
    configurable: true,
    get: () => descriptor?.get?.call(style),
    set: (value: string) => {
      seen.push(value);
      descriptor?.set?.call(style, value);
    },
  });
  return seen;
};

describe("placeTooltip", () => {
  it("sits right of and below the point", () => {
    const el = tip();
    placeTooltip(el, box(), 50, 60);
    expect(el.style.transform).toBe("translate(60px, 70px)");
  });

  it("flips left at the right edge and stays inside the box", () => {
    const el = tip();
    placeTooltip(el, box(), 350, 190);
    expect(el.style.transform).toBe("translate(240px, 160px)");
  });

  it("lands without the transition when first shown, then glides", () => {
    const el = tip();
    const seen = watchTransition(el);
    const b = box();
    placeTooltip(el, b, 50, 60);
    expect(seen).toEqual(["none", ""]);
    placeTooltip(el, b, 150, 60);
    expect(seen).toEqual(["none", ""]);
    expect(el.style.transform).toBe("translate(160px, 70px)");
  });

  it("lands in place again once it is hidden and shown anew", () => {
    const b = box();
    placeTooltip(tip(), b, 50, 60);
    const next = tip();
    const seen = watchTransition(next);
    placeTooltip(next, b, 300, 60);
    expect(seen).toEqual(["none", ""]);
  });
});
