import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToggleButton } from "../components/ToggleButton";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * Roundness followed `size`, and `corners` could only scope it — so a tall row
 * with modest corners, which is what every sidebar in the fleet wants, had no
 * prop. Aveiro and Studio both reached for an inline borderRadius instead,
 * five call sites between them.
 */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const cls = (ui: React.ReactElement) =>
  (render(ui, { wrapper: wrap }).container.firstElementChild as HTMLElement).className;

describe("ToggleButton radius", () => {
  it("still follows size when nothing is asked for", () => {
    expect(cls(<ToggleButton size="l">Row</ToggleButton>)).toContain("radius-l");
  });

  it("takes a radius of its own", () => {
    const c = cls(<ToggleButton size="l" radius="m">Row</ToggleButton>);
    expect(c).toContain("radius-m");
    expect(c).not.toMatch(/\bradius-l\b/);
  });

  it("scopes that radius to corners", () => {
    expect(cls(<ToggleButton size="l" radius="m" corners="top">Row</ToggleButton>)).toContain(
      "radius-m-top",
    );
  });

  it("accepts none from either prop", () => {
    expect(cls(<ToggleButton radius="none">Row</ToggleButton>)).toContain("radius-none");
    expect(cls(<ToggleButton corners="none">Row</ToggleButton>)).toContain("radius-none");
  });
});
