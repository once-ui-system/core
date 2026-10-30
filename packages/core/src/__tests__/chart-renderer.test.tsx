import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DataThemeProvider } from "../contexts/DataThemeProvider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { BarChart } from "../modules/data/BarChart";
import { LineBarChart } from "../modules/data/LineBarChart";
import { LineChart } from "../modules/data/LineChart";
import { PieChart } from "../modules/data/PieChart";
import {
  areaPath,
  barSlots,
  curvePath,
  fixedTicks,
  linearScale,
  niceTicks,
  roundedRect,
  sectorPath,
  stackSeries,
  thinTicks,
} from "../modules/data/utils/scale";

/**
 * 3.0 draws the charts itself, in SVG, instead of through recharts. The math
 * keeps recharts' rules, so the axes read as they did; the charts draw on the
 * server, in the first HTML.
 */

const Providers = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <DataThemeProvider>{children}</DataThemeProvider>
  </LayoutProvider>
);

const months = [
  { month: "Jan", web: 10, store: 30 },
  { month: "Feb", web: 20, store: 20 },
  { month: "Mar", web: 30, store: 10 },
];

/** The bar and sector paths: every path filled from a gradient or pattern. */
const shapes = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("svg path")).filter((p) =>
    p.getAttribute("fill")?.startsWith("url("),
  );

/** The numbers in a path's `d`, in order. */
const numbers = (d: string | null) => (d?.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

describe("scales", () => {
  it("picks recharts' round value ticks, from zero", () => {
    expect(niceTicks(0, 180)).toEqual([0, 45, 90, 135, 180]);
    expect(niceTicks(0, 3_000_000)).toEqual([0, 750_000, 1_500_000, 2_250_000, 3_000_000]);
    expect(niceTicks(0, 7)).toEqual([0, 2, 4, 6, 8]);
    expect(niceTicks(0, 1)).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it("keeps zero a tick when the values cross it", () => {
    expect(niceTicks(-0.4, 5.6)).toEqual([-2, 0, 2, 4, 6]);
    expect(niceTicks(-50, 0)).toContain(0);
  });

  it("gives a flat series a range to sit in", () => {
    const ticks = niceTicks(0, 0);
    expect(ticks.length).toBe(5);
    expect(ticks).toContain(0);
  });

  it("steps a fixed domain from its start and ends on its end", () => {
    expect(fixedTicks(5, 15)).toEqual([5, 8, 11, 14, 15]);
    expect(fixedTicks(0, 100)).toEqual([0, 25, 50, 75, 100]);
  });

  it("maps a domain onto a range, either way round", () => {
    const y = linearScale([0, 100], [200, 0]);
    expect(y(0)).toBe(200);
    expect(y(25)).toBe(150);
    expect(y(100)).toBe(0);
  });

  it("thins labels from the end, pulling the last inside the chart", () => {
    // Five 30px labels 20px apart in a 95px chart.
    const kept = thinTicks([10, 30, 50, 70, 90], [30, 30, 30, 30, 30], 0, 95);
    // The last moves in to end at the edge; the first would hang past the start.
    expect(kept.map((t) => t.index)).toEqual([1, 4]);
    expect(kept[1].at).toBe(80);
  });

  it("draws d3's curves through the points", () => {
    expect(
      curvePath(
        [
          [0, 0],
          [10, 10],
        ],
        "linear",
      ),
    ).toBe("M0,0L10,10");
    expect(
      curvePath(
        [
          [0, 0],
          [10, 10],
        ],
        "step",
      ),
    ).toBe("M0,0H5V10H10");
    const natural = curvePath(
      [
        [0, 0],
        [10, 10],
        [20, 0],
      ],
      "natural",
    );
    expect(natural.match(/C/g)?.length).toBe(2);
    expect(natural.endsWith("20,0")).toBe(true);
    // An area runs along the top, back along the base, and closes.
    expect(
      areaPath(
        [
          [0, 5],
          [10, 2],
        ],
        [
          [0, 10],
          [10, 10],
        ],
      ),
    ).toBe("M0,5L10,2L10,10L0,10Z");
  });

  it("rounds each corner on its own, never past half the side", () => {
    const flatBottom = roundedRect(0, 0, 40, 100, [6, 6, 0, 0]);
    expect(flatBottom.match(/A/g)?.length).toBe(2);
    // A 4px tall bar can round its corners by 2px at most.
    expect(roundedRect(0, 0, 40, 4, [6, 6, 6, 6])).toContain("A2,2");
  });

  it("draws ring sectors counter-clockwise from three o'clock", () => {
    const quarter = sectorPath(100, 100, 50, 80, 0, 90);
    // Starts on the right, at the outer radius, and sweeps up to twelve o'clock.
    expect(quarter.startsWith("M180,100A80,80 0 0 0 100,20")).toBe(true);
    expect(quarter.endsWith("Z")).toBe(true);
  });
});

describe("stacking", () => {
  it("stacks each series on the one before it", () => {
    const [web, store] = stackSeries(months, ["web", "store"]);
    expect(web).toEqual([
      [0, 10],
      [0, 20],
      [0, 30],
    ]);
    expect(store).toEqual([
      [10, 40],
      [20, 40],
      [30, 40],
    ]);
  });

  it("scales a percent stack to each row's share, ending at 1", () => {
    const [web, store] = stackSeries(months, ["web", "store"], true);
    expect(web[0]).toEqual([0, 0.25]);
    expect(store[0]).toEqual([0.25, 1]);
    for (const row of store) expect(row[1]).toBeCloseTo(1);
  });

  it("adds nothing for a missing value, and a zero row stays at zero", () => {
    const [a, b] = stackSeries([{ a: 5 }, { a: 0, b: 0 }], ["a", "b"], true);
    expect(b[0]).toEqual([1, 1]);
    expect(a[1]).toEqual([0, 0]);
  });

  it("stacks bars in one slot per category", () => {
    const { container } = render(
      <BarChart data={months} series={[{ key: "web" }, { key: "store" }]} stack />,
      { wrapper: Providers },
    );
    const bars = shapes(container);
    expect(bars).toHaveLength(6);
    // Jan's two bars share a slot: the store bar (rounded 6px at its top
    // corners) starts where the square web bar does.
    const janWeb = numbers(bars[0].getAttribute("d"));
    const janStore = numbers(bars[3].getAttribute("d"));
    expect(janStore[0] - 6).toBeCloseTo(janWeb[0], 5);
  });

  it("fills a percent stack to the top of the plot", () => {
    const { container } = render(
      <LineChart data={months} series={[{ key: "web" }, { key: "store" }]} stack="percent" />,
      { wrapper: Providers },
    );
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(container.querySelectorAll("svg path").length).toBeGreaterThanOrEqual(4);
  });
});

describe("bars", () => {
  it("places bars in recharts' slots: centred, 4px apart, shrunk to fit", () => {
    expect(barSlots(83, 1, 40)).toEqual([{ offset: 22, size: 40 }]);
    expect(barSlots(100, 2, 40)).toEqual([
      { offset: 8, size: 40 },
      { offset: 52, size: 40 },
    ]);
    // Too wide for the band: 90% of it, shared.
    expect(barSlots(50, 2, 40).map((s) => s.size)).toEqual([22.5, 22.5]);
    expect(barSlots(50, 1, "fill")[0].size).toBe(45);
  });

  it("lays horizontal bars along the x axis, one row per category", () => {
    const { container } = render(
      <BarChart data={months} series={{ key: "web" }} orientation="horizontal" />,
      { wrapper: Providers },
    );
    const bars = shapes(container).map((bar) => numbers(bar.getAttribute("d")));
    expect(bars).toHaveLength(3);
    // Each category sits below the last, and a bigger value reaches further right.
    const tops = bars.map((d) => d[1]);
    expect(tops[0]).toBeLessThan(tops[1]);
    expect(tops[1]).toBeLessThan(tops[2]);
    const rightEdge = (d: number[]) => Math.max(...d.filter((_, i) => i % 2 === 0));
    expect(rightEdge(bars[0])).toBeLessThan(rightEdge(bars[1]));
    expect(rightEdge(bars[1])).toBeLessThan(rightEdge(bars[2]));
    // The category names are written beside the bars, the values under them.
    expect(screen.getByText("Feb")).toBeInTheDocument();
    expect(screen.getByText("32")).toBeInTheDocument();
  });
});

describe("server rendering", () => {
  const charts = {
    LineChart: <LineChart data={months} series={[{ key: "web" }, { key: "store" }]} />,
    BarChart: <BarChart data={months} series={[{ key: "web" }, { key: "store" }]} />,
    LineBarChart: <LineBarChart data={months} series={[{ key: "web" }, { key: "store" }]} />,
    PieChart: (
      <PieChart
        data={[
          { name: "A", value: 2 },
          { name: "B", value: 1 },
        ]}
        series={{ key: "value" }}
      />
    ),
  };

  for (const [name, chart] of Object.entries(charts)) {
    it(`${name} draws its SVG in the first HTML`, () => {
      const html = renderToString(<Providers>{chart}</Providers>);
      expect(html).toMatch(/<svg[^>]*viewBox="0 0 640 320"/);
      expect(html).toMatch(/<path[^>]*d="M[\d.]+,[\d.]+/);
      expect(html).not.toMatch(/recharts/);
    });
  }

  it("writes the axis labels as text on the server", () => {
    const html = renderToString(<Providers>{charts.BarChart}</Providers>);
    for (const label of ["Jan", "Feb", "Mar", "0", "32"]) expect(html).toContain(`>${label}<`);
  });
});

describe("interaction", () => {
  it("hides a series from its legend entry, and brings it back", () => {
    const { container } = render(
      <BarChart data={months} series={[{ key: "web" }, { key: "store" }]} />,
      { wrapper: Providers },
    );
    expect(shapes(container)).toHaveLength(6);
    const web = screen.getByRole("button", { name: "web" });
    expect(web).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(web);
    expect(web).toHaveAttribute("aria-pressed", "false");
    expect(shapes(container)).toHaveLength(3);
    fireEvent.click(web);
    expect(shapes(container)).toHaveLength(6);
  });

  it("moves the tooltip through the rows with the arrow keys", () => {
    const { container } = render(
      <LineChart data={months} series={[{ key: "web" }, { key: "store" }]} />,
      { wrapper: Providers },
    );
    const plot = container.querySelector("[tabindex='0']") as HTMLElement;
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    // The tooltip names the row and each series' value.
    expect(screen.getAllByText("Jan").length).toBe(2);
    // Once in the legend, once in the tooltip.
    expect(screen.getAllByText("store").length).toBe(2);
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    expect(screen.getAllByText("Feb").length).toBe(2);
    fireEvent.keyDown(plot, { key: "End" });
    expect(screen.getAllByText("Mar").length).toBe(2);
    fireEvent.keyDown(plot, { key: "Escape" });
    expect(screen.getAllByText("Mar").length).toBe(1);
  });

  it("shows a slice's name and value from the keyboard", () => {
    const { container } = render(
      <PieChart
        data={[
          { name: "Apples", value: 2 },
          { name: "Pears", value: 1 },
        ]}
        series={{ key: "value" }}
        legend={{ display: false }}
      />,
      { wrapper: Providers },
    );
    const plot = container.querySelector("[tabindex='0']") as HTMLElement;
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    expect(screen.getByText("Apples")).toBeInTheDocument();
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    expect(screen.getByText("Pears")).toBeInTheDocument();
  });
});
