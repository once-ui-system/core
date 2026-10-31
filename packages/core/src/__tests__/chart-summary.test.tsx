import { render as rtlRender, screen, within } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { BarChart } from "../modules/data/BarChart";
import { ChartSummary } from "../modules/data/ChartSummary";
import { LineBarChart } from "../modules/data/LineBarChart";
import { LineChart } from "../modules/data/LineChart";
import { PieChart } from "../modules/data/PieChart";
import { chartSummary, chartSummaryTable } from "../modules/data/utils/chartSummary";
import { expectNoAxeViolations } from "../test/axe";

/**
 * A chart is one figure to a screen reader, named by a plain-language summary
 * of its data, with the numbers in a hidden table inside the card. The text is
 * written from the same series, x key, format and locale the chart draws with.
 */
// The charts draw their SVG in the first render, with the tooltip's layout context.
const render = (ui: React.ReactElement) => rtlRender(ui, { wrapper: LayoutProvider });

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const revenue = [4200, 3100, 5000, 6100, 7200, 8000, 9100, 12400, 10200, 9900, 8800, 11000];
const cost = [3000, 2800, 3200, 3300, 3500, 3600, 3900, 4100, 4000, 3900, 3800, 4200];
const rows = months.map((month, i) => ({ month, revenue: revenue[i], cost: cost[i] }));
const series = [
  { key: "revenue" as const, label: "Revenue" },
  { key: "cost" as const, label: "Cost" },
];

/** Intl writes hu-HU groups with a no-break space; compare with a plain one. */
const plain = (text: string | null | undefined) => (text ?? "").replace(/\s/g, " ");

describe("chartSummary", () => {
  it("names the series and the x range, then each series' highest and lowest point", () => {
    expect(chartSummary({ data: rows, series })).toBe(
      "Revenue and Cost, Jan to Dec. Revenue: highest 12,400 in Aug, lowest 3,100 in Feb. " +
        "Cost: highest 4,200 in Dec, lowest 2,800 in Feb.",
    );
  });

  it("writes numbers in the chart's locale and format", () => {
    // hu-HU groups from five digits on: 12 400, but 3100.
    expect(plain(chartSummary({ data: rows, series: [series[0]], locale: "hu-HU" }))).toBe(
      "Revenue, Jan to Dec. Revenue: highest 12 400 in Aug, lowest 3100 in Feb.",
    );
    expect(
      plain(
        chartSummary({
          data: rows,
          series: [series[0]],
          locale: "hu-HU",
          valueFormat: { style: "currency", currency: "HUF", maximumFractionDigits: 0 },
        }),
      ),
    ).toBe("Revenue, Jan to Dec. Revenue: highest 12 400 Ft in Aug, lowest 3100 Ft in Feb.");
    expect(chartSummary({ data: rows, series: [series[0]], valueFormat: "compact" })).toBe(
      "Revenue, Jan to Dec. Revenue: highest 12.4K in Aug, lowest 3.1K in Feb.",
    );
  });

  it("uses a series' own format over the chart's", () => {
    const data = [
      { q: "Q1", share: 0.25 },
      { q: "Q2", share: 0.5 },
    ];
    expect(chartSummary({ data, series: { key: "share", format: "percent" } })).toBe(
      "share, Q1 to Q2. share: highest 50% in Q2, lowest 25% in Q1.",
    );
  });

  it("puts a plain-text title in front", () => {
    expect(chartSummary({ data: rows.slice(0, 2), series: [series[0]], title: "Sales" })).toBe(
      "Sales. Revenue, Jan to Feb. Revenue: highest 4,200 in Jan, lowest 3,100 in Feb.",
    );
  });

  it("writes x values the way the axis does: the row's label, or the date format", () => {
    const data = [
      { date: "2026-01-01", v: 1 },
      { date: "2026-03-01", v: 3 },
    ];
    expect(chartSummary({ data, series: { key: "v" }, date: { format: "MMM yyyy" } })).toBe(
      "v, Jan 2026 to Mar 2026. v: highest 3 in Mar 2026, lowest 1 in Jan 2026.",
    );
    expect(
      chartSummary({
        data: [
          { label: "Week 1", x: 1, v: 2 },
          { label: "Week 2", x: 2, v: 2 },
        ],
        series: { key: "v" },
      }),
    ).toBe("v, Week 1 to Week 2. v: 2 throughout.");
  });

  it("names a long list of series by count and describes the first three", () => {
    const data = [{ x: "a", s1: 1, s2: 2, s3: 3, s4: 4, s5: 5 }];
    expect(chartSummary({ data })).toBe(
      "5 series, a. s1: 1 throughout. s2: 2 throughout. s3: 3 throughout. and 2 more series.",
    );
  });

  it("says when there is nothing to describe", () => {
    expect(chartSummary({ data: [], series })).toBe("No data.");
  });

  it("describes a pie by each slice's share, largest first", () => {
    const data = [
      { browser: "Safari", users: 21 },
      { browser: "Chrome", users: 62 },
      { browser: "Firefox", users: 9 },
      { browser: "Edge", users: 5 },
      { browser: "Opera", users: 2 },
      { browser: "Other", users: 1 },
    ];
    expect(chartSummary({ kind: "pie", data, xKey: "browser", series: { key: "users" } })).toBe(
      "Share by browser: Chrome 62%, Safari 21%, Firefox 9%, Edge 5%, Opera 2% and 1 more.",
    );
    expect(
      plain(
        chartSummary({
          kind: "pie",
          data: data.slice(0, 2),
          xKey: "browser",
          series: { key: "users" },
          locale: "hu-HU",
          title: "Böngészők",
        }),
      ),
    ).toBe("Böngészők: Chrome 75%, Safari 25%.");
  });
});

describe("chartSummaryTable", () => {
  it("has the x values as rows and a column per series label, formatted", () => {
    const table = chartSummaryTable({ data: rows.slice(0, 2), series, locale: "hu-HU" });
    expect(table.columns).toEqual(["month", "Revenue", "Cost"]);
    expect(table.rows.map((r) => [r.x, ...r.values.map(plain)])).toEqual([
      ["Jan", "4200", "3000"],
      ["Feb", "3100", "2800"],
    ]);
  });

  it("adds each slice's share for a pie", () => {
    const table = chartSummaryTable({
      kind: "pie",
      data: [
        { name: "A", value: 3 },
        { name: "B", value: 1 },
      ],
      xKey: "name",
      series: { key: "value", label: "Users" },
    });
    expect(table.columns).toEqual(["name", "Users", "Share"]);
    expect(table.rows).toEqual([
      { x: "A", values: ["3", "75%"] },
      { x: "B", values: ["1", "25%"] },
    ]);
  });
});

describe("ChartSummary", () => {
  it("renders the data as a visually hidden table with headers", () => {
    const { container } = render(
      <ChartSummary data={rows.slice(0, 2)} series={series} caption="Revenue data" />,
    );
    const table = screen.getByRole("table", { name: "Revenue data" });
    expect(container.firstElementChild?.className).toMatch(/hidden/);
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((th) => th.textContent),
    ).toEqual(["month", "Revenue", "Cost"]);
    expect(within(table).getByRole("rowheader", { name: "Feb" })).toBeTruthy();
    expect(within(table).getByRole("cell", { name: "3,100" })).toBeTruthy();
  });

  it("renders nothing without rows", () => {
    const { container } = render(<ChartSummary data={[]} series={series} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("charts carry the summary", () => {
  const charts = {
    LineChart: <LineChart title="Sales" data={rows} series={series} xKey="month" />,
    BarChart: <BarChart title="Sales" data={rows} series={series} xKey="month" />,
    LineBarChart: <LineBarChart title="Sales" data={rows} series={series} xKey="month" />,
  };

  for (const [name, chart] of Object.entries(charts)) {
    it(`${name}: the plot is a figure named by the summary, with the table in the card`, async () => {
      const { container } = render(chart);
      const plot = await screen.findByRole("figure");
      expect(plot.getAttribute("aria-label")).toBe(
        `Sales. ${chartSummary({ data: rows, series, xKey: "month" })}`,
      );
      const card = container.firstElementChild as HTMLElement;
      // The table sits in the card, outside the figure, so a reader can walk it.
      const table = within(card).getByRole("table");
      expect(plot.contains(table)).toBe(false);
      expect(within(table).getAllByRole("row")).toHaveLength(rows.length + 1);
      await expectNoAxeViolations(container);
    });
  }

  it("PieChart: names its slices' shares", async () => {
    const { container } = render(
      <PieChart
        title="Browsers"
        data={[
          { name: "Chrome", value: 62 },
          { name: "Safari", value: 38 },
        ]}
        series={{ key: "value" }}
      />,
    );
    const plot = await screen.findByRole("figure");
    expect(plot.getAttribute("aria-label")).toBe("Browsers: Chrome 62%, Safari 38%.");
    await expectNoAxeViolations(container);
  });

  it("writes the summary in the chart's locale", async () => {
    render(
      <LineChart
        data={rows}
        series={[series[0]]}
        xKey="month"
        locale="hu-HU"
        valueFormat="number"
      />,
    );
    const plot = await screen.findByRole("figure");
    expect(plain(plot.getAttribute("aria-label"))).toBe(
      "Revenue, Jan to Dec. Revenue: highest 12 400 in Aug, lowest 3100 in Feb.",
    );
  });

  it("takes the author's summary after the title, and aria-label for the whole name", async () => {
    const { unmount } = render(
      <BarChart title="Sales" data={rows} series={series} summary="Revenue tripled in summer." />,
    );
    expect((await screen.findByRole("figure")).getAttribute("aria-label")).toBe(
      "Sales. Revenue tripled in summer.",
    );
    unmount();
    const { container } = render(
      <BarChart title="Sales" data={rows} series={series} aria-label="Monthly sales" />,
    );
    expect((await screen.findByRole("figure")).getAttribute("aria-label")).toBe("Monthly sales");
    // Not left on the card as well.
    expect((container.firstElementChild as HTMLElement).getAttribute("aria-label")).toBeNull();
  });

  it("is no figure while loading or without data, so the status is read", async () => {
    render(<LineChart title="Sales" data={[]} series={series} />);
    await screen.findByText(/no data/i);
    expect(screen.queryByRole("figure")).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
  });
});
