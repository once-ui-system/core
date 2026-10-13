import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations, expectNoAxeViolations } from "../test/axe";

/**
 * The accessibility assertions every 2.1 component test can use (ROADMAP W1):
 * proof that the helper passes a clean tree and catches a broken one.
 */
describe("axe helper", () => {
  it("passes a labelled control", async () => {
    const { container } = render(
      <label>
        Accept the terms <input type="checkbox" />
      </label>,
    );
    await expectNoAxeViolations(container);
  });

  it("reports an unlabelled button", async () => {
    const { container } = render(<button type="button" />);
    const violations = await axeViolations(container);
    expect(violations.some((line) => line.startsWith("button-name"))).toBe(true);
  });
});
