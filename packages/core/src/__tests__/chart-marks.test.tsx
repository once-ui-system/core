import { render as rtlRender, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { BarChart } from "../modules/data/BarChart";
import { LineChart } from "../modules/data/LineChart";
import { chartSummary } from "../modules/data/utils/chartSummary";
import { beyond, markStroke } from "../modules/data/utils/marks";
import { expectNoAxeViolations } from "../test/axe";

/**
 * Thresholds and annotations: drawn so they read without colour, labelled in
 * the plot, and said in the summary a screen reader hears.
 */
const render = (ui: React.ReactElement) => rtlRender(ui, { wrapper: LayoutProvider });

const rows = ["14:00", "14:01", "14:02", "14:03", "14:04"].map((time, i) => ({
  time,
  outlet: [300, 318, 331, 336, 310][i],
}));
const series = { key: "outlet" as const, label: "Outlet" };

describe("chart thresholds", () => {
  it("draws heavier, more solid lines for heavier tones", () => {
    const danger = markStroke("danger");
    const warning = markStroke("warning");
    const info = markStroke("info");
    expect(danger.dash).toBeUndefined();
    expect(danger.width).toBeGreaterThan(warning.width);
    expect(warning.dash).toBeTruthy();
    expect(info.dash).not.toBe(warning.dash);
    expect(danger.hatch && warning.hatch && !info.hatch).toBe(true);
  });

  it("knows which side of a line, and which band, is out of limits", () => {
    expect(beyond({ value: 325, label: "High" }, 330)).toBe(true);
    expect(beyond({ value: 325, label: "High" }, 320)).toBe(false);
    expect(beyond({ value: 10, label: "Low", direction: "below" }, 5)).toBe(true);
    expect(beyond({ from: 340, label: "Trip" }, 345)).toBe(true);
    expect(beyond({ from: 340, to: 350, label: "Trip" }, 355)).toBe(false);
    expect(beyond({ from: 0, to: 9, label: "Ok", direction: "none" }, 5)).toBe(false);
  });

  it("says which series crossed which limit, how often and first when", () => {
    expect(
      chartSummary({
        data: rows,
        series,
        thresholds: [
          { value: 325, label: "High alarm" },
          { from: 340, label: "Trip", tone: "danger" },
        ],
        annotations: [{ x: "14:03", label: "Pump B trip" }],
      }),
    ).toBe(
      "Outlet, 14:00 to 14:04. Outlet: highest 336 in 14:03, lowest 300 in 14:00. " +
        "Outlet: above High alarm (325) at 2 points, first at 14:02. " +
        "No point in Trip (340 and up). Marked: Pump B trip at 14:03.",
    );
  });

  it("labels each limit and moment in the plot, and names them in the figure", async () => {
    const { container } = render(
      <LineChart
        title="Core temperature"
        data={rows}
        series={series}
        xKey="time"
        thresholds={[
          { value: 325, label: "High alarm" },
          { from: 340, label: "Trip", tone: "danger" },
        ]}
        annotations={[{ x: "14:03", label: "Pump B trip", tone: "danger" }]}
      />,
    );
    expect(container.querySelector("line[data-threshold='warning']")).toBeTruthy();
    expect(container.querySelector("g[data-threshold='danger'] rect")).toBeTruthy();
    expect(container.querySelector("line[data-annotation='danger']")).toBeTruthy();
    expect(screen.getByText("High alarm")).toBeTruthy();
    expect(screen.getByText("Trip")).toBeTruthy();
    expect(screen.getByText("Pump B trip")).toBeTruthy();
    const figure = screen.getByRole("figure");
    expect(figure.getAttribute("aria-label")).toContain("above High alarm (325) at 2 points");
    await expectNoAxeViolations(container);
  });

  it("stretches the value axis to a limit above the data, and zooms to yDomain", () => {
    const { container, rerender } = render(
      <BarChart
        data={rows}
        series={series}
        xKey="time"
        thresholds={[{ value: 400, label: "Max" }]}
      />,
    );
    const ticks = () =>
      [...container.querySelectorAll("span")]
        .map((s) => s.textContent)
        .filter((t) => /^\d+$/.test(t ?? ""));
    expect(ticks()).toContain("400");
    rerender(
      <BarChart data={rows} series={series} xKey="time" yDomain={[280, 340]} thresholds={[]} />,
    );
    expect(ticks()[0]).toBe("280");
    expect(ticks()).toContain("340");
    expect(ticks()).not.toContain("0");
  });
});
