import { describe, expect, it } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { BarChart } from "../src/components/charts/BarChart";
import { LineChart } from "../src/components/charts/LineChart";
import { curvePath, niceTicks, resolveSeries } from "../src/components/charts/scale";
import { ThemeProvider } from "../src/theme";

const wrap = (node: ReactNode) => render(<ThemeProvider theme="dark">{node}</ThemeProvider>);

// The plot only draws once `onLayout` reports its size, as on a device.
const layout = (testID: string, width = 320, height = 240) =>
  fireEvent(screen.getByTestId(testID), "layout", {
    nativeEvent: { layout: { x: 0, y: 0, width, height } },
  });

const data = [
  { month: "Jan", coffee: 120, tea: 80 },
  { month: "Feb", coffee: 150, tea: 60 },
  { month: "Mar", coffee: 90, tea: 110 },
];
const series = [
  { key: "coffee", color: "orange" },
  { key: "tea", color: "emerald" },
];

describe("charts on React Native", () => {
  it("draws a bar per series and row once measured, with a legend and header", async () => {
    await wrap(<BarChart title="Sales" description="Cups per month" data={data} series={series} />);
    expect(screen.getByText("Sales")).toBeTruthy();
    expect(screen.getByText("coffee")).toBeTruthy();
    expect(screen.queryByTestId("bar-coffee-0")).toBeNull();
    await layout("chart-plot");
    for (const key of ["coffee", "tea"]) {
      for (const i of [0, 1, 2]) expect(screen.getByTestId(`bar-${key}-${i}`)).toBeTruthy();
    }
    // Taller value, taller bar.
    const height = (id: string) => Number(screen.getByTestId(id).props.height);
    expect(height("bar-coffee-1")).toBeGreaterThan(height("bar-coffee-0"));
  });

  it("shows a row's values in a tooltip when tapped, and hides it on a second tap", async () => {
    await wrap(<BarChart data={data} series={series} />);
    await layout("chart-plot");
    const feb = screen.getByRole("button", { name: "Feb: coffee 150, tea 60" });
    await fireEvent.press(feb);
    expect(screen.getByText("150")).toBeTruthy();
    expect(screen.getByText("60")).toBeTruthy();
    await fireEvent.press(feb);
    expect(screen.queryByText("150")).toBeNull();
  });

  it("draws a line and an area per series, and the tapped points", async () => {
    await wrap(<LineChart testID="trend" data={data} series={series} curve="monotone" />);
    await layout("trend-plot");
    expect(screen.getByTestId("line-coffee")).toBeTruthy();
    expect(screen.getByTestId("area-tea")).toBeTruthy();
    expect(screen.queryByTestId("point-coffee-2")).toBeNull();
    await fireEvent.press(screen.getByRole("button", { name: /^Mar:/ }));
    expect(screen.getByTestId("point-coffee-2")).toBeTruthy();
    expect(screen.getByTestId("point-tea-2")).toBeTruthy();
    expect(screen.getByText("110")).toBeTruthy();
  });

  it("shows the empty, loading and error states instead of the plot", async () => {
    await wrap(
      <>
        <BarChart data={[]} series={series} />
        <LineChart data={[]} series={series} emptyState="Nothing brewed yet" />
        <LineChart data={data} series={series} error />
        <BarChart data={data} series={series} loading />
      </>,
    );
    expect(screen.getByText("No data available for the selected period")).toBeTruthy();
    expect(screen.getByText("Nothing brewed yet")).toBeTruthy();
    expect(screen.getByText("An error occurred while fetching data")).toBeTruthy();
    expect(screen.getByLabelText("Loading")).toBeTruthy();
    expect(screen.queryByTestId("chart-plot")).toBeNull();
    expect(screen.queryByText("coffee")).toBeNull();
  });

  it("filters rows by date and writes their labels with date.format", async () => {
    await wrap(
      <LineChart
        data={[
          { date: "2026-01-01", visits: 5 },
          { date: "2026-02-01", visits: 9 },
          { date: "2026-03-01", visits: 7 },
        ]}
        series={{ key: "visits" }}
        date={{ start: new Date(2026, 0, 15), end: new Date(2026, 2, 15), format: "MMM d" }}
      />,
    );
    await layout("chart-plot");
    // SVG tick labels aren't text to the query; each row's button carries its label.
    expect(screen.getAllByRole("button").map((b) => b.props.accessibilityLabel)).toEqual([
      "Feb 1: visits 9",
      "Mar 1: visits 7",
    ]);
  });
});

describe("chart helpers", () => {
  it("picks the x key and numeric series like core", () => {
    const { xKey, series: picked } = resolveSeries(data, undefined);
    expect(xKey).toBe("month");
    expect(picked.map((s) => s.key)).toEqual(["coffee", "tea"]);
    // Two series get core's complementary pair.
    expect(picked.map((s) => s.color)).toEqual(["blue", "orange"]);
  });

  it("makes round ticks from zero", () => {
    expect(niceTicks(0, 150)).toEqual([0, 50, 100, 150]);
    expect(niceTicks(-20, 85)).toEqual([-50, 0, 50, 100]);
  });

  it("draws d3's curves", () => {
    const points: [number, number][] = [
      [0, 0],
      [10, 10],
      [20, 0],
    ];
    expect(curvePath(points, "linear")).toBe("M0,0L10,10L20,0");
    expect(curvePath(points, "stepAfter")).toBe("M0,0H10V10H20V0");
    expect(curvePath(points, "natural")).toMatch(/^M0,0C.*C.* 20,0$/);
  });
});
