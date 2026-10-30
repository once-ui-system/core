import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { Legend } from "../modules/data/Legend";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const payload = [
  { value: "Visitors", color: "red" },
  { value: "Signups", stroke: "blue" },
];
const swatches = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("div")).filter((el) =>
    el.style.border.includes("1px solid"),
  );

/**
 * The chart legend: one swatch and name per series, coloured from `colors`
 * when given and the series otherwise, laid over the chart without catching
 * the pointer, at one of six positions.
 */
describe("Legend", () => {
  it("renders nothing without series", () => {
    const { container } = render(<Legend payload={[]} />, { wrapper });
    expect(container).toBeEmptyDOMElement();
  });

  it("names every series beside its swatch", async () => {
    const { container } = render(<Legend payload={payload} />, { wrapper });
    expect(screen.getByText("Visitors")).toBeInTheDocument();
    expect(screen.getByText("Signups")).toBeInTheDocument();
    expect(swatches(container).map((el) => el.style.borderColor)).toEqual(["red", "blue"]);
    expect((container.firstElementChild as HTMLElement).className).toMatch(/pointer-events-none/);
    await expectNoAxeViolations(container);
  });

  it("takes colours from `colors` where given", () => {
    const { container } = render(<Legend payload={payload} colors={["green"]} />, { wrapper });
    expect(swatches(container).map((el) => el.style.borderColor)).toEqual(["green", "blue"]);
  });

  it("draws the swatch for the variant", () => {
    const { container } = render(<Legend payload={payload} variant="outline" />, { wrapper });
    expect(swatches(container)[0].style.background).toBe("transparent");
  });

  it.each([
    ["top-right", { justifyContent: "flex-end", top: "var(--static-space-12)" }],
    ["bottom-left", { bottom: "var(--static-space-12)" }],
    ["top-center", { left: "50%", transform: "translateX(-50%)" }],
  ] as const)("positions itself at %s", (position, expected) => {
    const { container } = render(<Legend payload={payload} position={position} />, { wrapper });
    const style = (container.firstElementChild as HTMLElement).style;
    for (const [key, value] of Object.entries(expected)) {
      expect(style[key as keyof CSSStyleDeclaration]).toBe(value);
    }
  });

  it("clears the y axis labels at top-left unless the axis is reversed", () => {
    const { container, rerender } = render(<Legend payload={payload} />, { wrapper });
    const root = () => container.firstElementChild as HTMLElement;
    // Past the 64px value axis, plus 16px: the legend starts where the plot does.
    expect(root().style.left).toBe("64px");
    expect(root().style.paddingLeft).toBe("var(--static-space-16)");
    // A wider axis (a currency, horizontal bars' names) moves it with the plot.
    rerender(<Legend payload={payload} axisWidth={120} />);
    expect(root().style.left).toBe("120px");
    rerender(<Legend payload={payload} reverseY />);
    expect(root().style.paddingLeft).toBe("var(--static-space-20)");
    rerender(<Legend payload={payload} labels="x" />);
    expect(root().style.paddingLeft).toBe("var(--static-space-20)");
  });
});
