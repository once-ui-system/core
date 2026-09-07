import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Column } from "../components";
import { LayoutProvider } from "../contexts";

/**
 * `opacity={0}` and `zIndex={0}` are legal values — `Opacity` includes 0 and
 * `zIndex` includes -1 and 0 — and `.opacity-0` / `.z-index-0` ship in the
 * stylesheet. They were unreachable because the class list guarded them on
 * truthiness rather than presence, so the single most useful value of each
 * prop (hide a layer, pin to the base stacking level) silently did nothing.
 *
 * The bug surfaced building a hover cross-fade: both images rendered at full
 * opacity, stacked.
 */
describe("zero-valued style props", () => {
  it("emits opacity-0 for opacity={0}", () => {
    const { container } = render(<Column opacity={0} data-testid="t" />);
    expect(container.firstElementChild).toHaveClass("opacity-0");
  });

  it("still emits the other opacity steps", () => {
    const { container } = render(<Column opacity={40} />);
    expect(container.firstElementChild).toHaveClass("opacity-40");
  });

  it("omits the class entirely when opacity is not set", () => {
    const { container } = render(<Column />);
    expect(container.firstElementChild?.className).not.toMatch(/\bopacity-/);
  });

  it("emits z-index-0 for zIndex={0}", () => {
    const { container } = render(<Column zIndex={0} />);
    expect(container.firstElementChild).toHaveClass("z-index-0");
  });

  // Responsive props route through ClientFlex, which needs the provider.
  it("emits the responsive zero variants too", () => {
    const { container } = render(
      <LayoutProvider>
        <Column s={{ opacity: 0, zIndex: 0 }} />
      </LayoutProvider>,
    );
    const el = container.querySelector('[class*="s-opacity"]');
    expect(el).toHaveClass("s-opacity-0");
    expect(el).toHaveClass("s-z-index-0");
  });
});
