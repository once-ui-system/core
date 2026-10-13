import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { DataThemeProvider } from "../contexts/DataThemeProvider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ChartHeader } from "../modules/data/ChartHeader";
import { LinearGradient, RadialGradient } from "../modules/data/Gradient";
import { Legend } from "../modules/data/Legend";
import { Swatch } from "../modules/data/Swatch";

/**
 * The chart parts call their hooks on every render, in the same order.
 *
 * ChartHeader returned `null` before its hooks when it had nothing to show. A
 * header that went empty and came back lost its hook state, and the cleanup of
 * its Escape listener with it: the listener stayed on `document` for good.
 * Legend, Swatch and the gradients read the data theme in a default parameter,
 * which runs only when `variant` is omitted, so the hook was called on some
 * renders and not others. These tests pin the output on both paths and the
 * switch between them.
 */

const withTheme =
  (variant: "flat" | "outline") =>
  ({ children }: { children: React.ReactNode }) => (
    <LayoutProvider>
      <DataThemeProvider variant={variant}>{children}</DataThemeProvider>
    </LayoutProvider>
  );

/** The background of each swatch: the only elements here with an inline border. */
const swatchBackgrounds = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("[style*='border']")).map(
    (swatch) => swatch.style.background,
  );

const stopOpacities = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("stop")).map((stop) => stop.getAttribute("stop-opacity"));

describe("ChartHeader", () => {
  const wrapper = withTheme("flat");
  const range = { startDate: new Date(2026, 0, 1), endDate: new Date(2026, 0, 31) };

  it("renders nothing without a title, description or date", () => {
    const { container } = render(<ChartHeader />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it("renders the title and description", () => {
    render(<ChartHeader title="Revenue" description="Last 30 days" />, { wrapper });
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  it("switches between titled and empty across renders", () => {
    const { container, rerender } = render(<ChartHeader title="Revenue" />, { wrapper });
    expect(screen.getByText("Revenue")).toBeInTheDocument();

    rerender(<ChartHeader />);
    expect(container.firstChild).toBeNull();

    rerender(<ChartHeader title="Visitors" />);
    expect(screen.getByText("Visitors")).toBeInTheDocument();
  });

  it("removes its Escape listener on unmount after going empty and back", () => {
    const added = vi.spyOn(document, "addEventListener");
    const removed = vi.spyOn(document, "removeEventListener");
    const header = <ChartHeader title="Revenue" dateRange={range} date={{ selector: true }} />;

    const { rerender, unmount } = render(header, { wrapper });
    fireEvent.click(screen.getByRole("button", { name: "Choose a date range" }));
    rerender(<ChartHeader />);
    rerender(header);
    unmount();

    const keydown = (calls: unknown[][]) =>
      calls.filter(([type]) => type === "keydown").map(([, listener]) => listener);
    const leaked = keydown(added.mock.calls).filter(
      (listener) => !keydown(removed.mock.calls).includes(listener),
    );
    expect(leaked).toEqual([]);
  });
});

describe("Swatch", () => {
  it("takes its variant from the data theme when none is passed", () => {
    const { container } = render(<Swatch color="red" />, { wrapper: withTheme("outline") });
    expect(swatchBackgrounds(container)).toEqual(["transparent"]);
  });

  it("prefers the variant prop, and switches between prop and theme across renders", () => {
    const { container, rerender } = render(<Swatch color="red" variant="flat" />, {
      wrapper: withTheme("outline"),
    });
    expect(swatchBackgrounds(container)).toEqual(["red"]);

    rerender(<Swatch color="red" />);
    expect(swatchBackgrounds(container)).toEqual(["transparent"]);

    rerender(<Swatch color="red" variant="flat" />);
    expect(swatchBackgrounds(container)).toEqual(["red"]);
  });
});

describe("Legend", () => {
  const wrapper = withTheme("outline");
  const payload = [
    { value: "Visitors", color: "red" },
    { value: "Signups", color: "blue" },
  ];

  it("renders nothing without entries", () => {
    const { container } = render(<Legend payload={[]} />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it("renders a label and a swatch in the theme's variant for each entry", () => {
    const { container } = render(<Legend payload={payload} />, { wrapper });
    expect(screen.getByText("Visitors")).toBeInTheDocument();
    expect(screen.getByText("Signups")).toBeInTheDocument();
    expect(swatchBackgrounds(container)).toEqual(["transparent", "transparent"]);
  });

  it("switches between an explicit variant, empty and the theme across renders", () => {
    const { container, rerender } = render(<Legend payload={payload} variant="flat" />, {
      wrapper,
    });
    expect(swatchBackgrounds(container)).toEqual(["red", "blue"]);

    rerender(<Legend payload={[]} />);
    expect(container.firstChild).toBeNull();

    rerender(<Legend payload={payload} />);
    expect(swatchBackgrounds(container)).toEqual(["transparent", "transparent"]);
  });
});

describe("LinearGradient and RadialGradient", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DataThemeProvider variant="flat">
      <svg aria-hidden="true">
        <defs>{children}</defs>
      </svg>
    </DataThemeProvider>
  );

  it("take their stops from the data theme when no variant is passed", () => {
    const linear = render(<LinearGradient id="l" color="red" />, { wrapper });
    expect(stopOpacities(linear.container)).toEqual(["1", "1"]);
    linear.unmount();

    const radial = render(<RadialGradient id="r" color="red" />, { wrapper });
    expect(stopOpacities(radial.container)).toEqual(["1", "1"]);
  });

  it("prefer the variant prop, and switch between prop and theme across renders", () => {
    const linear = render(<LinearGradient id="l" color="red" variant="gradient" />, { wrapper });
    expect(stopOpacities(linear.container)).toEqual(["1", "0"]);
    linear.rerender(<LinearGradient id="l" color="red" />);
    expect(stopOpacities(linear.container)).toEqual(["1", "1"]);
    linear.rerender(<LinearGradient id="l" color="red" variant="outline" />);
    expect(stopOpacities(linear.container)).toEqual(["0", "0"]);
    linear.unmount();

    // Radial stops run the other way: transparent at the centre.
    const radial = render(<RadialGradient id="r" color="red" variant="gradient" />, { wrapper });
    expect(stopOpacities(radial.container)).toEqual(["0", "1"]);
    radial.rerender(<RadialGradient id="r" color="red" />);
    expect(stopOpacities(radial.container)).toEqual(["1", "1"]);
  });

  it("use explicit stops over any variant", () => {
    const { container } = render(
      <LinearGradient id="l" color="red" stops={[{ offset: "50%", opacity: 0.5 }]} />,
      { wrapper },
    );
    expect(stopOpacities(container)).toEqual(["0.5"]);
  });
});
