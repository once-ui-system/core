import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Select } from "../components/Select";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * `classNames("fill-width", { ...flags, className })` read the caller's class
 * as a *condition*, not a value: clsx emitted the literal string "className"
 * whenever the prop was truthy and the caller's class never reached the DOM.
 */
describe("Select className", () => {
  it("puts the caller's class on the element", () => {
    const { container } = render(
      <LayoutProvider>
        <Select
          id="s"
          label="Pick"
          className="my-custom-class"
          options={[{ value: "a", label: "Alpha" }]}
        />
      </LayoutProvider>,
    );
    const html = container.innerHTML;
    expect(html).toContain("my-custom-class");
    expect(html).not.toMatch(/class="[^"]*\bclassName\b/);
  });
});
