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
