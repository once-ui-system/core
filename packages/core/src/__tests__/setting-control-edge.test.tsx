import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../components/Button";
import { Setting } from "../components/Setting";
import { Slider } from "../components/Slider";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * A setting's control keeps to the row's trailing edge, also when a narrow
 * row wraps it under the label, so its buttons are always in one place.
 */
describe("Setting control placement", () => {
  it("pushes the control area to the trailing edge", () => {
    const { container } = render(
      <Setting label="Password" description="Last changed 14 Aug 2026">
        <Button size="s">Change</Button>
      </Setting>,
      { wrapper: ({ children }) => <LayoutProvider>{children}</LayoutProvider> },
    );
    const area = container.querySelector<HTMLElement>('[style*="margin-left: auto"]');
    expect(area).not.toBeNull();
    expect(area).toHaveTextContent("Change");
    expect(area).not.toHaveTextContent("Password");
    // Sized to its control, capped by controlWidth: a filled area would wrap
    // under the label in any row narrower than label plus cap.
    expect(area).not.toHaveClass("fill-width");
    expect(area?.style.maxWidth).toBe("14rem");
  });

  it("lets a filling control such as a Slider grow up to the cap", () => {
    const { container } = render(
      <Setting label="Duration" controlWidth="16rem">
        <Slider value={1} min={1} max={15} onValueChange={() => {}} />
      </Setting>,
      { wrapper: ({ children }) => <LayoutProvider>{children}</LayoutProvider> },
    );
    const area = container.querySelector<HTMLElement>('[style*="margin-left: auto"]');
    // Sized only to its content, the area left a full-width Slider nothing to
    // fill, and it collapsed to its thumb (3.0.0).
    expect(area?.style.flexGrow).toBe("1");
    expect(area?.style.maxWidth).toBe("16rem");
  });
});
