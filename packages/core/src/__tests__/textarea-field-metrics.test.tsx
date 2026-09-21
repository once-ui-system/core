import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";

/**
 * A textarea has to measure like the input beside it.
 *
 * It used to pin its own height inline — 48px with a placeholder, 56px
 * without — which ignored `size` entirely and left a placeholder-only textarea
 * 8px shorter than an `m` input. The first line then sat at the top of the
 * content box while the input centred its value, an 11px step that reads as a
 * misplaced placeholder and becomes glaring once a `Form` fuses the two into
 * one control.
 *
 * jsdom does not lay text out, so these assert the two structural causes
 * rather than the pixel offset: no inline height override, and a height that
 * tracks the size token.
 */

const surface = (c: HTMLElement) => c.querySelector<HTMLElement>("[data-surface]");

const sizeClass = (el: Element | null) =>
  (["xs", "s", "m", "l", "xl"] as const)
    .filter((s) => new RegExp(`(?:^|[\\s_])${s}(?=_|\\s|$)`).test(el?.className.toString() ?? ""))
    .join(",");

describe("Textarea field metrics", () => {
  it("pins no height of its own, with or without a placeholder", () => {
    for (const placeholder of [undefined, "Note"]) {
      const { container, unmount } = render(<Textarea id="t" placeholder={placeholder} />);
      expect(surface(container)?.style.minHeight).toBe("");
      unmount();
    }
  });

  it("takes its height from the size token, like an input", () => {
    for (const size of ["s", "m", "xl"] as const) {
      const area = render(<Textarea id="t" placeholder="Note" size={size} />);
      const input = render(<Input id="i" placeholder="Email" size={size} />);

      // Same size class means the same `--fld-h`, so the two rows match.
      expect(sizeClass(surface(area.container))).toBe(size);
      expect(sizeClass(surface(area.container))).toBe(sizeClass(surface(input.container)));

      area.unmount();
      input.unmount();
    }
  });

  it("keeps the auto-sizing contract", () => {
    // `lines="auto"` is the default and forces `resize: none`; a numeric
    // `lines` is the only way to get a resize handle back.
    const auto = render(<Textarea id="a" placeholder="Note" />);
    expect(auto.container.querySelector("textarea")?.style.resize).toBe("none");
    auto.unmount();

    const fixed = render(<Textarea id="b" placeholder="Note" lines={4} />);
    expect(fixed.container.querySelector("textarea")?.style.resize).toBe("vertical");
    expect(fixed.container.querySelector("textarea")?.getAttribute("rows")).toBe("4");
  });
});
