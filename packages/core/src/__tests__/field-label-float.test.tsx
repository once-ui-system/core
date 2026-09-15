import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";

/**
 * An uncontrolled field — how a settings form normally renders saved data —
 * has no `value`, so `isFilled` stayed false and the label rendered on top of
 * the text until the first focus and blur. Every prefilled field on a profile
 * form was overlapped at once.
 */
const SRC = join(import.meta.dirname, "..", "components");

const labelOf = (c: HTMLElement) => c.querySelector("label")?.className ?? "";

describe("floating label", () => {
  it.each([
    ["defaultValue", { defaultValue: "Anna Mikhailova" }],
    ["value", { value: "Anna Mikhailova", onChange: () => {} }],
  ])("Input floats its label for %s", (_name, props) => {
    const { container } = render(<Input id="n" label="Full name" {...props} />);
    expect(labelOf(container)).toMatch(/floating/);
  });

  it.each([
    ["defaultValue", { defaultValue: "Design lead." }],
    ["value", { value: "Design lead.", onChange: () => {} }],
  ])("Textarea floats its label for %s", (_name, props) => {
    const { container } = render(<Textarea id="a" label="About" {...props} />);
    expect(labelOf(container)).toMatch(/floating/);
  });

  /**
   * Autofill fires no focus, blur or change event, so the label would sit on
   * top of the filled text. Input.module.scss hangs an inert animation off
   * `:-webkit-autofill` and the components listen for it by name — verified
   * end to end in Chromium, which is the only place it can be: jsdom has no
   * `AnimationEvent`, so React never attaches an `animationstart` listener.
   *
   * What is checkable here is the contract between the two files: rename the
   * keyframe on one side and autofill silently stops working.
   */
  it("keeps the autofill keyframe name agreed between the SCSS and the TSX", () => {
    const scss = readFileSync(join(SRC, "Input.module.scss"), "utf8");
    expect(scss).toMatch(/@keyframes\s+onAutoFill\b/);
    // Bound to autofill, with a duration — a 0s animation need not fire.
    expect(scss).toMatch(/:-webkit-autofill\s*\{[^}]*animation:\s*onAutoFill\s+\d+m?s/s);

    for (const file of ["Input.tsx", "Textarea.tsx"]) {
      const tsx = readFileSync(join(SRC, file), "utf8");
      expect(tsx, file).toMatch(/onAnimationStart=\{handleAnimationStart\}/);
      expect(tsx, file).toMatch(/styles\.onAutoFill/);
      expect(tsx, file).toMatch(/includes\("onAutoFill"\)/);
    }
  });

  /**
   * Opt-in, because a field ships without a ring on purpose. The CSS is the
   * part that decides when it shows; what is checkable here is that the class
   * only ever appears when asked for.
   */
  it.each([
    ["Input", (on: boolean) => <Input id="r" label="Email" focusRing={on} />],
    ["Textarea", (on: boolean) => <Textarea id="r" label="About" focusRing={on} />],
  ])("%s takes the focus ring only when asked", (_n, make) => {
    const off = render(make(false));
    expect(off.container.querySelector('[class*="base"]')?.className).not.toMatch(/focusRing/);
    off.unmount();

    const on = render(make(true));
    expect(on.container.querySelector('[class*="base"]')?.className).toMatch(/focusRing/);
  });

  it("scopes the ring to keyboard-style focus, on the field not the control", () => {
    const scss = readFileSync(join(SRC, "Input.module.scss"), "utf8");
    // On `.base`: the control is inset by the border and the Column's padding,
    // so its own outline would be drawn inside the field.
    expect(scss).toMatch(/\.base\.focusRing:has\(\.input:focus-visible\)/);
    // `:focus-visible`, never `:focus-within` — the latter would also fire for
    // a field focused programmatically.
    expect(scss).not.toMatch(/\.focusRing[^{]*:focus-within/);
  });

  it("leaves an empty field's label centred", () => {
    const { container } = render(<Input id="e" label="Full name" />);
    expect(labelOf(container)).not.toMatch(/floating/);
  });

  it("still tracks a controlled value back to empty", () => {
    const { container, rerender } = render(
      <Input id="c" label="Full name" value="Anna" onChange={() => {}} />,
    );
    expect(labelOf(container)).toMatch(/floating/);
    rerender(<Input id="c" label="Full name" value="" onChange={() => {}} />);
    expect(labelOf(container)).not.toMatch(/floating/);
  });
});
